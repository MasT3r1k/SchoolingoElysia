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
            .select(['users.person', 'users.manager', 'users.principal', 'users.userId'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) return { error: 'no_user', details: 'no_db' };

        const canCreate = auth.manager !== -1 || auth.principal;

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
                'polls.created_by'
            ])
            .where('polls.created_by', '=', auth.userId);

        // 2. Definujeme dotaz pro sdílené polly
        const sharedPollsQuery = db
            .selectFrom('poll_shares')
            .innerJoin('polls', 'poll_shares.poll_id', 'polls.id') // innerJoin je zde bezpečnější pro integritu
            .select([
                'polls.id',
                'polls.title',
                'polls.description',
                'polls.type',
                'polls.time_limit',
                'polls.created_at',
                'polls.created_by'
            ])
            .where('poll_shares.is_valid', '=', true);

        // 3. Spojíme je pomocí unionAll a seřadíme jako celek
        const allPolls = await ownPollsQuery
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
            .select('users.person')
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) return { error: 'no_user', details: 'no_db' };

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

        const questionsWithOptions = questions.map(q => ({
            ...q,
            options: options.filter(o => o.question_id === q.id)
        }));

        return { 
            poll, 
            questions: questionsWithOptions, 
            submission: submission || null 
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

        const existing = await db.selectFrom('poll_responses')
            .select('id')
            .where('poll_id', '=', Number(id))
            .where('student_id', '=', auth.person)
            .executeTakeFirst();
            
        if (existing) return { error: 'invalid_data', details: 'Already submitted' };

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

        const resResult = await db.insertInto('poll_responses').values({
            poll_id: Number(id),
            student_id: auth.person,
            started_at: new Date().toISOString(),
            submitted_at: new Date().toISOString(),
            total_score: 0,
            total_max_score: 0
        }).execute();
        
        const responseId = Number(resResult[0].insertId);

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

            await db.insertInto('poll_answers').values({
                response_id: responseId,
                question_id: q.id,
                answer_text: ans.answerText || null,
                option_id: ans.optionId || null,
                option_ids: ans.optionIds ? JSON.stringify(ans.optionIds) : null,
                points_awarded: pointsAwarded,
                is_manually_graded: 0
            }).execute();
        }

        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        
        await db.updateTable('poll_responses')
            .set({ 
                total_score: totalScore,
                total_max_score: maxScore,
                percentage: percentage
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
              .select(['users.person', 'users.manager', 'users.principal'])
              .where('tokens.token', '=', token)
              .where('tokens.expires', '>=', new Date())
              .executeTakeFirst();
              
         if (!auth?.person) return { error: 'no_user', details: 'no_db' };
         
         const isTeacher = auth.manager !== -1 || auth.principal;
         
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

         const responses = await db.selectFrom('poll_responses')
            .select([
                'poll_responses.id',
                'poll_responses.total_score', 
                'poll_responses.total_max_score', 
                'poll_responses.percentage',
                'poll_responses.submitted_at',
                'poll_responses.student_id',
            ])
            .where('poll_id', '=', Number(id))
            .execute();

         const responsesWithNames = await Promise.all(responses.map(async r => ({
             ...r,
             studentId: r.student_id,
             studentName: await format_person_by_id(r.student_id)
         })));

         const answers = await db.selectFrom('poll_answers')
            .leftJoin('poll_responses', 'poll_responses.id', 'poll_answers.response_id')
            .leftJoin('poll_questions', 'poll_questions.id', 'poll_answers.question_id')
            .select(['poll_answers.question_id', 'poll_answers.points_awarded', 'poll_questions.points as maxPoints'])
            .where('poll_responses.poll_id', '=', Number(id))
            .execute();
            
         const questionStats: Record<number, { correct: number, wrong: number, total: number }> = {};
         answers.forEach(a => {
             if (!questionStats[a.question_id]) questionStats[a.question_id] = { correct: 0, wrong: 0, total: 0 };
             questionStats[a.question_id].total++;
             const max = a.maxPoints ?? 0;
             if (a.points_awarded === max && max > 0) {
                 questionStats[a.question_id].correct++;
             } else {
                 questionStats[a.question_id].wrong++;
             }
         });

         return { responses: responsesWithNames, questionStats };
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

export default app;
