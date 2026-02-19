import { Elysia, t } from 'elysia';
import { sql } from 'kysely';
import { db } from '../../../../../database';
import { format_person_by_id } from '../../../../functions/format_person_by_id';

const app = new Elysia({ prefix: '/polls' })

    // GET / - List available polls
    .get('/', async ({ cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person', 'users.manager', 'users.principal', 'users.userId', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) return { error: 'no_user', details: 'no_db' };

        const canCreate = auth.manager == -1 || auth.role == "teacher" || auth.principal == true;

        // 1. Definujeme dotaz pro vlastní pollly
        const ownPollsQuery = db
            .selectFrom('polls')
            .select([
                'polls.id',
                'polls.title',
                'polls.description',
                'polls.type',
                'polls.time_limit',
                'polls.created_at',
                'polls.created_by',
                sql<Date | null>`null`.as('active_from'),
                sql<Date | null>`null`.as('active_to'),
                sql<number | null>`null`.as('assignmentId'),
                sql<Date | null>`null`.as('submitted_at'),
            ])
            .where('polls.created_by', '=', auth.person);

        // 2. Definujeme dotaz pro sdílené polly
        // 2. Definujeme dotaz pro přiřazené polly (studenti)
        const assignedPollsQuery = db
            .selectFrom('poll_assign_recipients')
            .innerJoin('poll_assigns', 'poll_assigns.poll_assign_id', 'poll_assign_recipients.poll_assign_id')
            .innerJoin('polls', 'poll_assigns.poll_id', 'polls.id')
            .innerJoin('student_groups', 'student_groups.groupId', 'poll_assign_recipients.group_id')
            .leftJoin('poll_responses', (join) => join
                .on('poll_responses.student_id', '=', auth.person)
                .onRef('poll_responses.poll_id', '=', 'poll_assigns.poll_id')
            )
            .select([
                'polls.id',
                'polls.title',
                'polls.description',
                'polls.type',
                'polls.time_limit', // Fallback
                'polls.created_at',
                'polls.created_by',
                'poll_assigns.start as active_from',
                'poll_assigns.end as active_to',
                'poll_assigns.poll_assign_id as assignmentId',
                'poll_responses.submitted_at'
            ])
            .where('poll_assign_recipients.assigned', '=', true)
            .where('student_groups.student', '=', auth.person);

        // 3. Definujeme dotaz pro sdílené polly (učitelé)
        const sharedPollsQuery = db
            .selectFrom('poll_shares')
            .innerJoin('polls', 'poll_shares.poll_id', 'polls.id')
            .select([
                'polls.id',
                'polls.title',
                'polls.description',
                'polls.type',
                'polls.time_limit',
                'polls.created_at',
                'polls.created_by',
                sql<Date | null>`null`.as('active_from'),
                sql<Date | null>`null`.as('active_to'),
                sql<number | null>`null`.as('assignmentId'),
                sql<Date | null>`null`.as('submitted_at'),
            ])
            .where('poll_shares.is_valid', '=', true)
            .where('poll_shares.person_id', '=', auth.person);

        // 4. Spojíme je pomocí unionAll a seřadíme jako celek
        const allPolls = await ownPollsQuery
            .unionAll(assignedPollsQuery)
            .unionAll(sharedPollsQuery)
            .orderBy('created_at', 'desc')
            .execute();

        // 4. Doplníme jména autorů
        const pollsWithAuthors = await Promise.all(allPolls.map(async (p) => ({
            ...p,
            authorName: p.created_by ? await format_person_by_id(p.created_by) : 'Unknown'
        })));

        return { polls: pollsWithAuthors, canCreate };
    })

    // GET /:id - Get details (questions)
    .get('/:id', async ({ params: { id }, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db.selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person', 'users.userId'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) return { error: 'no_user', details: 'no_db' };

        // Check if user has an assignment for this poll
        // Check if user has an assignment for this poll
        const assignment = await db
            .selectFrom('poll_assign_recipients')
            .innerJoin('poll_assigns', 'poll_assigns.poll_assign_id', 'poll_assign_recipients.poll_assign_id')
            .innerJoin('student_groups', 'student_groups.groupId', 'poll_assign_recipients.group_id')
            .select([
                'poll_assigns.poll_assign_id',
                'poll_assigns.start',
                'poll_assigns.end',
                'poll_assigns.time_limit',
                'poll_assigns.shuffle_questions',
                'poll_assigns.shuffle_options',
                'poll_assigns.show_results',
                'poll_assigns.allow_review',
            ])
            .where('poll_assigns.poll_id', '=', Number(id))
            .where('student_groups.student', '=', auth.person)
            .where('poll_assign_recipients.assigned', '=', true)
            .executeTakeFirst();

        const poll = await db
            .selectFrom('polls')
            .selectAll()
            .where('id', '=', Number(id))
            .executeTakeFirst();

        if (!poll) return { error: 'not_found' };

        const questions = await db
            .selectFrom('poll_questions')
            .selectAll()
            .where('poll_id', '=', Number(id))
            .orderBy('order', 'asc')
            .execute();

        const submission = await db
            .selectFrom('poll_responses')
            .select(['id', 'submitted_at', 'total_score', 'total_max_score', 'percentage'])
            .where('poll_id', '=', Number(id))
            .where('student_id', '=', auth.person)
            .executeTakeFirst();

        const questionIds = questions.map(q => q.id);
        let options: any[] = [];
        if (questionIds.length > 0) {
            options = await db
                .selectFrom('poll_options')
                .select(['id', 'question_id', 'label', 'order']) 
                .where('question_id', 'in', questionIds)
                .orderBy('order', 'asc')
                .execute();
        }

        if (submission) {
             const storedQuestions = await db
                .selectFrom('poll_response_questions')
                .innerJoin('poll_questions', 'poll_questions.id', 'poll_response_questions.question_id')
                .selectAll('poll_questions')
                .select(['poll_response_questions.display_order', 'poll_response_questions.options_order'])
                .where('poll_response_questions.response_id', '=', submission.id)
                .orderBy('poll_response_questions.display_order', 'asc')
                .execute();

             if (storedQuestions.length > 0) {
                 // Use stored order
                 const questionsWithOptions = storedQuestions.map(q => {
                     let qOptions = options.filter(o => o.question_id === q.id);
                     if (q.options_order) {
                         // Sort options based on stored order
                         try {
                             const order = JSON.parse(q.options_order); // array of IDs
                             if (Array.isArray(order)) {
                                 qOptions = qOptions.sort((a, b) => {
                                     const idxA = order.indexOf(a.id);
                                     const idxB = order.indexOf(b.id);
                                     return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
                                 });
                             }
                         } catch (e) {}
                     }
                     return {
                         ...q,
                         options: qOptions
                     };
                 });
                 
                 return { 
                    poll, 
                    questions: questionsWithOptions, 
                    submission: submission || null,
                    assignment: assignment || null
                 };
             }
        }

        const questionsWithOptions = questions.map(q => ({
            ...q,
            options: options.filter(o => o.question_id === q.id)
        }));

        return { 
            poll, 
            questions: questionsWithOptions, 
            submission: submission || null,
            assignment: assignment || null
        };
    }, {
        params: t.Object({
            id: t.String()
        })
    })

    // POST / - Create (Teacher only)
    .post('/', async ({ body, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person', 'users.manager', 'users.principal'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) return { error: 'no_user', details: 'no_db' };
        if (auth.manager === -1 && !auth.principal) return { error: 'no_permission' };

        const { title, description, type, questions, time_limit } = body as any;

        const result = await db.insertInto('polls').values({
            title,
            description,
            type,
            created_by: auth.person,
            time_limit: time_limit ? Number(time_limit) : null
        }).execute();

        const pollId = Number(result[0].insertId);

        if (questions && Array.isArray(questions)) {
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const qRes = await db.insertInto('poll_questions').values({
                    poll_id: pollId,
                    title: q.title,
                    type: q.type,
                    points: q.points || 0,
                    order: i
                }).execute();
                
                const qId = Number(qRes[0].insertId);

                if (q.options && Array.isArray(q.options)) {
                    for (let j = 0; j < q.options.length; j++) {
                        const o = q.options[j];
                        await db.insertInto('poll_options').values({
                            question_id: qId,
                            label: o.label,
                            is_correct: o.is_correct ? 1 : 0,
                            order: j
                        }).execute();
                    }
                }
            }
        }

        return { success: true, id: pollId };
    }, {
        body: t.Object({
            title: t.String(),
            description: t.Optional(t.String()),
            type: t.Union([t.Literal('feedback'), t.Literal('test')]),
            time_limit: t.Optional(t.Number({ default: 0, minimum: 0, maximum: 999 })),
            questions: t.Array(t.Object({
                title: t.String(),
                type: t.Union([t.Literal('text'), t.Literal('single'), t.Literal('multiple')]),
                points: t.Number(),
                options: t.Optional(t.Array(t.Object({
                    label: t.String(),
                    is_correct: t.Boolean()
                })))
            }))
        })
    })

    // POST /assign - Assign poll to classes/students
    .post('/assign', async ({ body, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person', 'users.userId', 'users.manager', 'users.principal'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) return { error: 'no_user', details: 'no_db' };
        if (auth.manager === -1 && !auth.principal) return { error: 'no_permission' };

        const { pollId, targets, settings } = body as any;

        const assignResult = await db.insertInto('poll_assigns').values({
            poll_id: Number(pollId),
            assign_by: auth.userId!,
            time_limit: settings.timeLimit ? Number(settings.timeLimit) : null,
            start: settings.start ? new Date(settings.start) : new Date(),
            end: settings.end ? new Date(settings.end) : null,
            shuffle_questions: settings.shuffleQuestions ? true : false,
            shuffle_options: settings.shuffleOptions ? true : false,
            show_results: settings.showResults ? true : false,
            allow_review: settings.allowReview ? true : false,
            grade_column: settings.gradeColumn ? Number(settings.gradeColumn) : null
        }).execute();
        
        const assignmentId = Number(assignResult[0].insertId);
        
        if (targets && Array.isArray(targets)) {
            for (const target of targets) {
                await db.insertInto('poll_assign_recipients').values({
                    poll_assign_id: assignmentId,
                    group_id: target.groupId,
                    subject_id: target.subjectId,
                    assigned: true
                }).execute();
            }
        }

        return { success: true, assignmentId, count: targets?.length || 0 };

    }, {
        body: t.Object({
            pollId: t.Number(),
            targets: t.Array(t.Object({
                groupId: t.Number(),
                subjectId: t.Number()
            })),
            settings: t.Object({
                start: t.Optional(t.String()),
                end: t.Optional(t.String()),
                timeLimit: t.Optional(t.Nullable(t.Number())),
                shuffleQuestions: t.Optional(t.Boolean()),
                shuffleOptions: t.Optional(t.Boolean()),
                showResults: t.Optional(t.Boolean()),
                allowReview: t.Optional(t.Boolean()),
                gradeColumn: t.Optional(t.Nullable(t.Number()))
            })
        })
    })

    // POST /:id/start - Start the poll attempt
    .post('/:id/start', async ({ params: { id }, cookie, body }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db.selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();
            
        if (!auth?.person) return { error: 'no_user', details: 'no_db' };

        // Check if already started
        const existing = await db.selectFrom('poll_responses')
            .selectAll()
            .where('poll_id', '=', Number(id))
            .where('student_id', '=', auth.person)
            .executeTakeFirst();
            
        if (existing) {
             // Return existing state
             return { success: true, continued: true, responseId: existing.id };
        }

        // Get assignment settings
        const assignment = await db
            .selectFrom('poll_assign_recipients')
            .innerJoin('poll_assigns', 'poll_assigns.poll_assign_id', 'poll_assign_recipients.poll_assign_id')
            .innerJoin('student_groups', 'student_groups.groupId', 'poll_assign_recipients.group_id')
            .select([
                'poll_assigns.shuffle_questions',
                'poll_assigns.shuffle_options'
            ])
            .where('poll_assigns.poll_id', '=', Number(id))
            .where('student_groups.student', '=', auth.person)
            .where('poll_assign_recipients.assigned', '=', true)
            .executeTakeFirst();

        const questions = await db.selectFrom('poll_questions')
            .selectAll()
            .where('poll_id', '=', Number(id))
            .orderBy('order', 'asc')
            .execute();

        let finalQuestions = questions.map(q => q);
        if (assignment?.shuffle_questions) {
            finalQuestions = finalQuestions.sort(() => Math.random() - 0.5);
        }

        const resResult = await db.insertInto('poll_responses').values({
            poll_id: Number(id),
            student_id: auth.person,
            started_at: new Date(),
            total_score: 0,
            total_max_score: 0,
            metadata: JSON.stringify(body || {})
        }).execute();
        
        const responseId = Number(resResult[0].insertId);

        // Save order
        for (let i = 0; i < finalQuestions.length; i++) {
            const q = finalQuestions[i];
            let optionsOrder: string | null = null;
            
            if (assignment?.shuffle_options) {
                 const opts = await db.selectFrom('poll_options').select('id').where('question_id', '=', q.id).execute();
                 const shuffled = opts.map(o => o.id).sort(() => Math.random() - 0.5);
                 optionsOrder = JSON.stringify(shuffled);
            }

            await db.insertInto('poll_response_questions').values({
                response_id: responseId,
                question_id: q.id,
                display_order: i,
                options_order: optionsOrder
            }).execute();
        }

        return { success: true, responseId };
    }, {
         params: t.Object({
            id: t.String()
        }),
        body: t.Optional(t.Any())
    })

    // POST /:id/answer - Save single answer
    .post('/:id/answer', async ({ params: { id }, body, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db.selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();
            
        if (!auth?.person) return { error: 'no_user', details: 'no_db' };

        const response = await db.selectFrom('poll_responses')
            .select('id')
            .where('poll_id', '=', Number(id))
            .where('student_id', '=', auth.person)
            .executeTakeFirst();
            
        if (!response) return { error: 'not_started' };

        const { questionId, answerText, optionId, optionIds } = body as any;

        // Check if answer already exists
        const existingAnswer = await db.selectFrom('poll_answers')
            .select('id')
            .where('response_id', '=', response.id)
            .where('question_id', '=', questionId)
            .executeTakeFirst();

        if (existingAnswer) {
             const updateData: any = {
                selected_at: new Date()
             };
             if (answerText !== undefined) updateData.answer_text = answerText;
             if (optionId !== undefined) updateData.option_id = optionId;
             if (optionIds !== undefined) updateData.option_ids = JSON.stringify(optionIds);
             
            await db.updateTable('poll_answers')
                .set(updateData)
                .where('id', '=', existingAnswer.id)
                .execute();
        } else {
            await db.insertInto('poll_answers').values({
                response_id: response.id,
                question_id: questionId,
                answer_text: answerText || null,
                option_id: optionId || null,
                option_ids: optionIds ? JSON.stringify(optionIds) : null,
                points_awarded: 0,
                is_manually_graded: 0,
                selected_at: new Date()
            }).execute();
        }

        return { success: true };
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            questionId: t.Number(),
            answerText: t.Optional(t.String()),
            optionId: t.Optional(t.Number()),
            optionIds: t.Optional(t.Array(t.Number()))
        })
    })

    // POST /:id/submit - Submit answers
    .post('/:id/submit', async ({ params: { id }, body, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db.selectFrom('tokens')
             .leftJoin('users', 'users.userId', 'tokens.userId')
             .select('users.person')
             .where('tokens.token', '=', token)
             .where('tokens.expires', '>=', new Date())
             .executeTakeFirst();
             
        if (!auth?.person) return { error: 'no_user', details: 'no_db' };

        const allResponses = await db.selectFrom('poll_responses')
            .select(['id', 'submitted_at'])
            .where('poll_id', '=', Number(id))
            .where('student_id', '=', auth.person)
            .orderBy('id', 'desc')
            .execute();

        const active = allResponses.find(r => !r.submitted_at);
        
        if (!active) {
            if (allResponses.length > 0) return { error: 'invalid_data', details: 'Already submitted' };
            return { error: 'not_started' };
        }

        const responseId = active.id;
        // Don't create new response, update existing one at the end

        const { answers } = body as any;

         const questions = await db.selectFrom('poll_questions')
            .selectAll()
            .where('poll_id', '=', Number(id))
            .execute();
            
         const options = await db.selectFrom('poll_options')
            .selectAll()
            .where('question_id', 'in', questions.map(q => q.id))
            .execute();

        let totalScore = 0;
        let maxScore = 0;



        for (const ans of answers) {
            const q = questions.find(x => x.id === ans.questionId);
            if (!q) continue;

            let pointsAwarded = 0;
            maxScore += q.points;

            if (q.type === 'single' && ans.optionId) {
                const opt = options.find(o => o.id === ans.optionId);
                if (opt && opt.is_correct) {
                    pointsAwarded = q.points;
                }
            } else if (q.type === 'multiple' && ans.optionIds) {
                const selected = ans.optionIds as number[];
                const correctOptions = options.filter(o => o.question_id === q.id && o.is_correct).map(o => o.id);
                // All correct options key-check
                const isCorrect = correctOptions.length === selected.length && selected.every(s => correctOptions.includes(s));
                if (isCorrect) {
                     pointsAwarded = q.points;
                }
            }

            totalScore += pointsAwarded;

            // Upsert answer
            const existingAns = await db.selectFrom('poll_answers')
                .select('id')
                .where('response_id', '=', responseId)
                .where('question_id', '=', q.id)
                .executeTakeFirst();
                
            if (existingAns) {
                await db.updateTable('poll_answers')
                    .set({
                        points_awarded: pointsAwarded,
                        answer_text: ans.answerText || null,
                        option_id: ans.optionId || null,
                        option_ids: ans.optionIds ? JSON.stringify(ans.optionIds) : null,
                        selected_at: new Date()
                    })
                    .where('id', '=', existingAns.id)
                    .execute();
            } else {
                await db.insertInto('poll_answers').values({
                    response_id: responseId,
                    question_id: q.id,
                    answer_text: ans.answerText || null,
                    option_id: ans.optionId || null,
                    option_ids: ans.optionIds ? JSON.stringify(ans.optionIds) : null,
                    points_awarded: pointsAwarded,
                    is_manually_graded: 0,
                    selected_at: new Date()
                }).execute();
            }
        }

        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        
        await db.updateTable('poll_responses')
            .set({ 
                total_score: totalScore,
                total_max_score: maxScore,
                percentage: percentage,
                submitted_at: new Date()
            })
            .where('id', '=', responseId)
            .execute();

        return { success: true, score: totalScore, max: maxScore };
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            answers: t.Array(t.Object({
                questionId: t.Number(),
                answerText: t.Optional(t.String()),
                optionId: t.Optional(t.Number()),
                optionIds: t.Optional(t.Array(t.Number()))
            }))
        })
    })

    // GET /:id/results - Aggregated results
    .get('/:id/results', async ({ params: { id }, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db.selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person', 'users.manager', 'users.principal', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) return { error: 'no_user', details: 'no_db' };

        const isTeacher = auth.manager !== -1 || auth.principal || auth.role === 'teacher';

        if (!isTeacher) {
            const submission = await db.selectFrom('poll_responses')
                .select('id')
                .where('poll_id', '=', Number(id))
                .where('student_id', '=', auth.person)
                .executeTakeFirst();

            if (!submission) return { error: 'no_permission', details: 'Submit first' };

            const questions = await db.selectFrom('poll_questions').selectAll().where('poll_id', '=', Number(id)).execute();
            const options = await db.selectFrom('poll_options').selectAll().where('question_id', 'in', questions.map(q => q.id)).execute();

            return {
                questions: questions.map(q => ({
                    ...q,
                    options: options.filter(o => o.question_id === q.id)
                }))
            };
        }

        // 1. Get all assignments for this poll
        const assignments = await db.selectFrom('poll_assigns')
            .selectAll()
            .where('poll_id', '=', Number(id))
            .execute();

        const assignmentIds = assignments.map(a => a.poll_assign_id);

        if (assignmentIds.length === 0) {
            // No assignments yet, return only responses (if any)
            const responses = await db.selectFrom('poll_responses')
                .select(['id', 'total_score', 'total_max_score', 'percentage', 'submitted_at', 'started_at', 'student_id'])
                .where('poll_id', '=', Number(id))
                .execute();

            const responsesWithNames = await Promise.all(responses.map(async r => ({
                ...r,
                studentId: r.student_id,
                studentName: await format_person_by_id(r.student_id),
                status: r.submitted_at ? 'Finished' : (r.started_at ? 'Started' : 'Not started')
            })));

            return { responses: responsesWithNames, questionStats: {} };
        }

        // 2. Get all assigned groups/subjects
        const recipients = await db.selectFrom('poll_assign_recipients')
            .selectAll()
            .where('poll_assign_id', 'in', assignmentIds)
            .where('assigned', '=', true)
            .execute();

        const uniqueGroupIds = [...new Set(recipients.map(r => r.group_id))];

        // 3. Get all students in these groups
        let studentIds: number[] = [];
        if (uniqueGroupIds.length > 0) {
            const studentsInGroups = await db.selectFrom('student_groups')
                .select('student')
                .where('groupId', 'in', uniqueGroupIds)
                .execute();
            studentIds = [...new Set(studentsInGroups.map(s => s.student))];
        }

        // 4. Get all questions for this poll
        const questions = await db.selectFrom('poll_questions')
            .selectAll()
            .where('poll_id', '=', Number(id))
            .orderBy('order', 'asc')
            .execute();

        // 5. Get all responses for this poll
        const submissions = await db.selectFrom('poll_responses')
            .selectAll()
            .where('poll_id', '=', Number(id))
            .execute();

        // 6. Get all answers for these responses
        const submissionIds = submissions.map(s => s.id);
        let allAnswers: any[] = [];
        if (submissionIds.length > 0) {
            allAnswers = await db.selectFrom('poll_answers')
                .select(['response_id', 'question_id', 'points_awarded', 'is_manually_graded'])
                .where('response_id', 'in', submissionIds)
                .execute();
        }

        // 7. Process each student
        const finalResponses = await Promise.all(studentIds.map(async sid => {
            const submission = submissions.find(s => s.student_id === sid);
            const studentName = await format_person_by_id(sid);

            let questionResults: { questionId: number, correct: boolean | null, points: number | null }[] = [];
            
            questions.forEach(q => {
                const answer = submission ? allAnswers.find(a => a.response_id === submission.id && a.question_id === q.id) : null;
                let correct: boolean | null = null;
                if (answer) {
                    correct = answer.points_awarded === q.points && q.points > 0;
                }
                questionResults.push({
                    questionId: q.id,
                    correct,
                    points: answer ? answer.points_awarded : null
                });
            });

            return {
                id: submission?.id || null,
                studentId: sid,
                studentName,
                total_score: submission?.total_score || 0,
                total_max_score: submission?.total_max_score || 0,
                percentage: submission?.percentage || 0,
                started_at: submission?.started_at || null,
                submitted_at: submission?.submitted_at || null,
                status: submission?.submitted_at ? 'Finished' : (submission?.started_at ? 'Started' : 'Not started'),
                questionResults
            };
        }));

        // 8. Calculate question stats
        const questionStats: Record<number, { correct: number, wrong: number, total: number }> = {};
        questions.forEach(q => {
            questionStats[q.id] = { correct: 0, wrong: 0, total: 0 };
            allAnswers.filter(a => a.question_id === q.id).forEach(a => {
                questionStats[q.id].total++;
                if (a.points_awarded === q.points && q.points > 0) {
                    questionStats[q.id].correct++;
                } else {
                    questionStats[q.id].wrong++;
                }
            });
        });

        return { 
            responses: finalResponses.sort((a, b) => a.studentName.localeCompare(b.studentName)), 
            questionStats,
            questionsCount: questions.length
        };
    }, {
        params: t.Object({
            id: t.String()
        })
    })

    // GET /:id/student/:studentId
    .get('/:id/student/:studentId', async ({ params: { id, studentId }, cookie }) => {
         const token = cookie.token?.value as string;
         if (!token) return { error: 'no_user', details: 'no_cookie' };
         
         const auth = await db.selectFrom('tokens').leftJoin('users', 'users.userId', 'tokens.userId')
             .select(['users.manager', 'users.principal'])
             .where('tokens.token', '=', token)
             .where('tokens.expires', '>=', new Date())
             .executeTakeFirst();

         if (auth?.manager === -1 && !auth.principal) return { error: 'no_permission' };

         const response = await db.selectFrom('poll_responses')
             .selectAll()
             .where('poll_id', '=', Number(id))
             .where('student_id', '=', Number(studentId))
             .executeTakeFirst();
             
         if (!response) return { error: 'not_found' };

         const answers = await db.selectFrom('poll_answers')
             .selectAll()
             .where('response_id', '=', response.id)
             .execute();

         return { response, answers };
    }, {
        params: t.Object({
            id: t.String(),
            studentId: t.String()
        })
    })

    // POST /:id/student/:studentId/grade
    .post('/:id/student/:studentId/grade', async ({ params: { id, studentId }, body, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };
         
         const auth = await db.selectFrom('tokens').leftJoin('users', 'users.userId', 'tokens.userId')
             .select(['users.manager', 'users.principal'])
             .where('tokens.token', '=', token)
             .where('tokens.expires', '>=', new Date())
             .executeTakeFirst();

         if (auth?.manager === -1 && !auth.principal) return { error: 'no_permission' };

        const { updates } = body as any;

        const response = await db.selectFrom('poll_responses')
             .select('id')
             .where('poll_id', '=', Number(id))
             .where('student_id', '=', Number(studentId))
             .executeTakeFirst();
             
        if (!response) return { error: 'not_found' };

        for (const u of updates) {
            await db.updateTable('poll_answers')
                .set({ points_awarded: u.points, is_manually_graded: 1 })
                .where('id', '=', u.answerId)
                .where('response_id', '=', response.id)
                .execute();
        }

        const allAnswers = await db.selectFrom('poll_answers')
            .select('points_awarded')
            .where('response_id', '=', response.id)
            .execute();
            
        const totalScore = allAnswers.reduce((sum, a) => sum + (a.points_awarded || 0), 0);
        
        const questions = await db.selectFrom('poll_questions').select('points').where('poll_id', '=', Number(id)).execute();
        const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

         await db.updateTable('poll_responses')
            .set({ 
                total_score: totalScore,
                percentage: percentage
            })
            .where('id', '=', response.id)
            .execute();

        return { success: true, totalScore, percentage };
    }, {
         params: t.Object({
            id: t.String(),
            studentId: t.String()
        }),
        body: t.Object({
            updates: t.Array(t.Object({
                answerId: t.Number(),
                points: t.Number()
            }))
        })
    })

    // POST /:id/share - Share poll with another teacher
    .post('/:id/share', async ({ params: { id }, body, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person', 'users.manager', 'users.principal'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) return { error: 'no_user', details: 'no_db' };
        
        const pollId = Number(id);
        const { teacherId } = body as any;

        // Verify ownership
        const poll = await db
            .selectFrom('polls')
            .select(['created_by'])
            .where('id', '=', pollId)
            .executeTakeFirst();

        if (!poll) return { error: 'not_found' };

        if (poll.created_by !== auth.person) {
            return { error: 'no_permission', details: 'not_owner' };
        }

        // Get target user ID from person ID
        const targetUser = await db
            .selectFrom('teachers')
            .select('teachers.personId')
            .where('teachers.personId', '=', Number(teacherId))
            .executeTakeFirst();
            
        if (!targetUser) return { error: 'target_user_not_found' };

        // Check if already shared
        const existingShare = await db
            .selectFrom('poll_shares')
            .select('poll_share_id')
            .where('poll_id', '=', pollId)
            .where('person_id', '=', targetUser.personId)
            .executeTakeFirst();

        if (existingShare) {
             await db.updateTable('poll_shares')
                .set({ is_valid: true })
                .where('poll_share_id', '=', existingShare.poll_share_id)
                .execute();
             return { success: true };
        }

        await db.insertInto('poll_shares').values({
            poll_id: pollId,
            person_id: targetUser.personId,
            is_valid: true,
            added_at: new Date()
        }).execute();

        return { success: true };

    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            teacherId: t.Number()
        })
    })

    // GET /:id/shares - Get list of shared teachers
    .get('/:id/shares', async ({ params: { id }, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person', 'users.manager', 'users.principal'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) return { error: 'no_user', details: 'no_db' };

        const pollId = Number(id);

        // Verify ownership/permission
        const poll = await db
            .selectFrom('polls')
            .select(['created_by'])
            .where('id', '=', pollId)
            .executeTakeFirst();

        if (!poll) return { error: 'not_found' };
        if (poll.created_by !== auth.person) return { error: 'no_permission' };

        const sharesList = await db
            .selectFrom('poll_shares')
            .select([
                'poll_shares.poll_share_id as id',
                'poll_shares.person_id as personId',
                'poll_shares.added_at',
                'poll_shares.is_valid',
            ])
            .where('poll_id', '=', pollId)
            .where('is_valid', '=', true)
            .execute();

        const shares = await Promise.all(sharesList.map(async (s) => ({
            ...s,
            teacherName: await format_person_by_id(s.personId)
        })));

        return { shares };
    }, {
        params: t.Object({
            id: t.String()
        })
    })

    // DELETE /:id/shares/:shareId - Remove a share
    .delete('/:id/shares/:shareId', async ({ params: { id, shareId }, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) return { error: 'no_user', details: 'no_db' };

        // Verify ownership
        const poll = await db
            .selectFrom('polls')
            .select(['created_by'])
            .where('id', '=', Number(id))
            .executeTakeFirst();

        if (!poll) return { error: 'not_found' };
        if (poll.created_by !== auth.person) return { error: 'no_permission' };

        await db.updateTable('poll_shares')
            .set({ is_valid: false })
            .where('poll_share_id', '=', Number(shareId))
            .execute();

        return { success: true };
    }, {
        params: t.Object({
            id: t.String(),
            shareId: t.String()
        })
    })

export default app;
