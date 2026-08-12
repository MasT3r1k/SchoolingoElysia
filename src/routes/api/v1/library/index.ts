import { Elysia, t } from "elysia";
import { db } from "../../../../../database";

// Define Open Library Response Type (Partial)
interface OpenLibraryBook {
    title: string;
    authors?: { name: string }[];
    publishers?: { name: string }[];
    publish_date?: string;
    number_of_pages?: number;
    cover?: { medium?: string; large?: string };
    identifiers?: { isbn_13?: string[]; isbn_10?: string[] };
    excerpts?: { text: string }[];
    notes?: string;
}

export default new Elysia({ prefix: '/library' })
    .get('/stats', async ({ user, set }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        
        const totalBooks = await db.selectFrom('library_books')
            .select(db.fn.count('book_id').as('count'))
            .executeTakeFirst();
            
        const activeLoans = await db.selectFrom('library_loans')
            .where('status', '=', 'active')
            .select(db.fn.count('loan_id').as('count'))
            .executeTakeFirst();
            
        const overdueLoans = await db.selectFrom('library_loans')
            .where('status', '=', 'active')
            .where('due_date', '<', new Date())
            .select(db.fn.count('loan_id').as('count'))
            .executeTakeFirst();
            
        return {
            totalBooks: Number(totalBooks?.count || 0),
            activeLoans: Number(activeLoans?.count || 0),
            overdueLoans: Number(overdueLoans?.count || 0)
        };
    })
    .get('/lookup', async ({ query, set, user }: any) => {
        if (!user) {
            set.status = 401;
            return { error: "Unauthorized" };
        }
        
        const isbn = query.isbn;
        const title = query.title;
        
        if (!isbn && !title) {
            set.status = 400;
            return { error: "ISBN or Title is required" };
        }

        try {
            let url = '';
            if (isbn) url = `https://openlibrary.org/search.json?isbn=${isbn}&fields=title,author_name,first_publish_year,cover_i,publisher,number_of_pages_median`;
            else url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&fields=title,author_name,first_publish_year,cover_i,publisher,number_of_pages_median`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                set.status = 502;
                return { error: "Failed to fetch from Open Library" };
            }

            const data = await response.json() as any;
            const bookData = data.docs?.[0];

            if (!bookData) {
                set.status = 404;
                return { error: "Book not found" };
            }

            // Normalize Data
            return {
                isbn: isbn || "",
                title: bookData.title,
                author: bookData.author_name?.[0] || "",
                publisher: bookData.publisher?.[0] || "",
                published_year: bookData.first_publish_year || null,
                pages: bookData.number_of_pages_median || null,
                description: "",
                coverUrl: bookData.cover_i ? `https://covers.openlibrary.org/b/id/${bookData.cover_i}-L.jpg` : null,
            };
        } catch (error) {
            console.error("Open Library Lookup Error:", error);
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    }, {
        query: t.Object({
            isbn: t.Optional(t.String()),
            title: t.Optional(t.String())
        })
    })
    .get('/genres', async ({ user, set }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        return await db.selectFrom('library_genres').selectAll().execute();
    })
    .get('/books', async ({ user, set }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        return await db.selectFrom('library_books')
            .selectAll('library_books')
            .select((eb) => [
                eb.selectFrom('library_copies')
                    .whereRef('library_copies.book_id', '=', 'library_books.book_id')
                    .where('status', '=', 'available')
                    .select(eb.fn.countAll<number>().as('count'))
                    .as('available_copies'),
                eb.selectFrom('library_copies')
                    .whereRef('library_copies.book_id', '=', 'library_books.book_id')
                    .select(eb.fn.countAll<number>().as('count'))
                    .as('total_copies'),
                eb.selectFrom('library_book_ratings')
                    .whereRef('library_book_ratings.book_id', '=', 'library_books.book_id')
                    .select(eb.fn.avg<number>('rating').as('avg'))
                    .as('rating')
            ])
            .orderBy('created_at', 'desc')
            .execute();
    })
    .post('/books', async ({ body, set, user }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        try {
            const { copies, author, genreId, coverUrl, published_year, pages, description, ...bookData } = body;
            
            // Insert Book
            const result = await db.insertInto('library_books')
                .values({
                    ...bookData,
                    title: body.title,
                    author: body.author,
                    isbn: body.isbn,
                    publisher: body.publisher,
                    year_publication: published_year || new Date().getFullYear(),
                    genre_id: genreId || 1, // Default to first genre
                    pages: pages || 0,
                    description: description,
                    cover_url: coverUrl,
                    edition_number: 1,
                    created_at: new Date()
                })
                .executeTakeFirst();
            
            const bookId = Number(result.insertId);

            // Insert Copies if requested
            if (copies && copies > 0) {
                const copiesData = Array.from({ length: copies }).map((_, i) => ({
                    book_id: bookId,
                    copy_number: i + 1,
                    status: 'available' as const,
                    condition: 'new' as const,
                    location: 'Reception', // Default location
                    acquisition_date: new Date(),
                    notes: ''
                }));
                
                await db.insertInto('library_copies')
                    .values(copiesData)
                    .execute();
            }

            return { id: bookId, message: "Book added successfully" };
        } catch (error) {
            console.error("Add Book Error:", error);
            set.status = 500;
            return { error: "Failed to add book" };
        }
    }, {
        body: t.Object({
            title: t.String(),
            isbn: t.Optional(t.String()),
            author: t.String(), // Simplified for now
            publisher: t.Optional(t.String()),
            published_year: t.Optional(t.Number()),
            description: t.Optional(t.String()),
            coverUrl: t.Optional(t.String()),
            genreId: t.Optional(t.Number()),
            pages: t.Optional(t.Number()),
            copies: t.Number({ minimum: 0, default: 0 })
        })
    })
    .get('/reservations', async ({ user, set }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        return await db.selectFrom('library_reservations')
            .innerJoin('library_books', 'library_books.book_id', 'library_reservations.book_id')
            .innerJoin('persons', 'persons.person_id', 'library_reservations.person_id')
            .select([
                'reservation_id', 'reservation_date', 'status', 'created',
                'library_books.book_id', 'library_books.title', 'library_books.author',
                'persons.person_id', 'persons.first_name', 'persons.last_name'
            ])
            .orderBy('created', 'desc')
            .execute();
    })
    .post('/reservations/:id/cancel', async ({ params, set, user }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        await db.updateTable('library_reservations')
            .set({ status: 'cancelled' })
            .where('reservation_id', '=', parseInt(params.id))
            .execute();
        return { message: "Reservation cancelled" };
    })
    .post('/reservations/:id/fulfill', async ({ params, body, set, user }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        const { copyId } = body;
        
        try {
            const reservation = await db.selectFrom('library_reservations')
                .selectAll()
                .where('reservation_id', '=', parseInt(params.id))
                .executeTakeFirst();
                
            if (!reservation || reservation.status !== 'pending') {
                set.status = 400; return { error: "Invalid reservation" };
            }

            const copy = await db.selectFrom('library_copies')
                .select(['status', 'book_id'])
                .where('copy_id', '=', copyId)
                .executeTakeFirst();
                
            if (!copy || copy.status !== 'available' || copy.book_id !== reservation.book_id) {
                set.status = 400; return { error: "Copy not available or mismatch" };
            }

            await db.insertInto('library_loans')
                .values({
                    copy_id: copyId,
                    reader_id: reservation.person_id,
                    loan_date: new Date(),
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    status: 'ongoing',
                    notes: ''
                })
                .execute();

            await db.updateTable('library_copies')
                .set({ status: 'checked_out' })
                .where('copy_id', '=', copyId)
                .execute();

            await db.updateTable('library_reservations')
                .set({ status: 'fulfilled' })
                .where('reservation_id', '=', parseInt(params.id))
                .execute();

            return { message: "Reservation fulfilled" };
        } catch (e) {
            console.error(e);
            set.status = 500; return { error: "Processing failed" };
        }
    }, {
        body: t.Object({ copyId: t.Number() })
    })
    .get('/loans', async ({ user, set }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        return await db.selectFrom('library_loans')
            .innerJoin('library_copies', 'library_copies.copy_id', 'library_loans.copy_id')
            .innerJoin('library_books', 'library_books.book_id', 'library_copies.book_id')
            .select(['library_loans.loan_id', 'library_loans.due_date', 'library_loans.status', 'library_loans.loan_date',
                     'library_books.title', 'library_books.cover_url'])
            .where('reader_id', '=', user.user_id)
            .where('library_loans.status', '=', 'ongoing')
            .orderBy('due_date', 'asc')
            .execute();
    })
    .get('/loans/all', async ({ user, set }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        return await db.selectFrom('library_loans')
            .innerJoin('library_copies', 'library_copies.copy_id', 'library_loans.copy_id')
            .innerJoin('library_books', 'library_books.book_id', 'library_copies.book_id')
            .innerJoin('persons', 'persons.person_id', 'library_loans.reader_id')
            .select(['library_loans.loan_id', 'library_loans.due_date', 'library_loans.status', 'library_loans.loan_date', 'library_loans.return_date',
                     'library_books.title', 'library_books.cover_url',
                     'library_copies.copy_number', 'library_copies.barcode',
                     'persons.first_name', 'persons.last_name', 'persons.person_id'])
            .orderBy('loan_date', 'desc')
            .execute();
    })
    .get('/inventory', async ({ user, set }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        const copies = await db.selectFrom('library_copies')
            .innerJoin('library_books', 'library_books.book_id', 'library_copies.book_id')
            .leftJoin('library_loans', (join) => 
                join.onRef('library_loans.copy_id', '=', 'library_copies.copy_id')
                    .on('library_loans.status', '=', 'ongoing')
            )
            .leftJoin('persons', 'persons.person_id', 'library_loans.reader_id')
            .select([
                'library_copies.copy_id', 'library_copies.barcode', 'library_copies.copy_number', 'library_copies.status as copy_status', 'library_copies.condition',
                'library_books.title', 'library_books.author', 'library_books.isbn',
                'library_loans.loan_id', 'library_loans.due_date', 
                'persons.first_name', 'persons.last_name', 'persons.person_id'
            ])
            .orderBy('library_books.title', 'asc')
            .execute();
        return copies;
    })
    .get('/users', async ({ user, set }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        const users = await db.selectFrom('persons')
            .select(['person_id', 'first_name', 'last_name', 'type'])
            .where('deleted', '=', 0)
            .orderBy('last_name', 'asc')
            .execute();
        return users;
    })
    .post('/loans/:id/notify', async ({ params, set, user }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        try {
            const loan = await db.selectFrom('library_loans')
                .innerJoin('library_copies', 'library_copies.copy_id', 'library_loans.copy_id')
                .innerJoin('library_books', 'library_books.book_id', 'library_copies.book_id')
                .select(['library_loans.reader_id', 'library_books.title', 'library_loans.due_date'])
                .where('loan_id', '=', parseInt(params.id))
                .executeTakeFirst();
                
            if (!loan) { set.status = 404; return { error: "Loan not found" }; }

            // Insert notification
            await db.insertInto('notifications').values({
                user_id: loan.reader_id,
                type: 'library_overdue',
                data: JSON.stringify({ title: 'Upomínka z knihovny', message: `Upomínka pro knihu: ${loan.title}. Termín vrácení byl: ${loan.due_date ? new Date(loan.due_date).toLocaleDateString('cs-CZ') : 'Neznámý'}. Vraťte ji prosím.` }),
                url: '/library'
            }).execute();

            return { message: "Notification sent" };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { error: "Failed to send notification" };
        }
    })
    .post('/books/:id/rate', async ({ params, body, set, user }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        try {
            await db.insertInto('library_book_ratings')
                .values({
                    book_id: parseInt(params.id),
                    reader_id: user.user_id,
                    rating: body.rating,
                    review_text: body.review_text || null,
                    created_at: new Date()
                })
                .execute();
            return { message: "Rating added" };
        } catch (e) {
            console.error(e);
            set.status = 500; return { error: "Failed to add rating" };
        }
    }, {
        body: t.Object({
            rating: t.Number({ minimum: 1, maximum: 5 }),
            review_text: t.Optional(t.String())
        })
    })
    .get('/books/:id/ratings', async ({ params, set }: any) => {
        return await db.selectFrom('library_book_ratings')
            .innerJoin('persons', 'persons.person_id', 'library_book_ratings.reader_id')
            .select(['rating_id', 'rating', 'review_text', 'created_at', 'persons.first_name', 'persons.last_name'])
            .where('book_id', '=', parseInt(params.id))
            .orderBy('created_at', 'desc')
            .execute();
    })
    .post('/copies', async ({ body, set, user }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        try {
            const { bookId, count } = body;
            
            // Get max copy number for this book
            const maxCopyResult = await db.selectFrom('library_copies')
                .where('book_id', '=', bookId)
                .select(eb => eb.fn.max('copy_number').as('max_copy'))
                .executeTakeFirst();
            
            const startCopyNumber = (Number(maxCopyResult?.max_copy) || 0) + 1;

            const copiesData = Array.from({ length: count }).map((_, i) => ({
                book_id: bookId,
                copy_number: startCopyNumber + i,
                status: 'available' as const,
                condition: 'new' as const,
                location: 'Reception',
                acquisition_date: new Date(),
                notes: ''
            }));
            
            await db.insertInto('library_copies')
                .values(copiesData)
                .execute();

            return { message: "Copies added" };
        } catch(e) { console.error(e); set.status = 500; return { error: "Failed" }; }
    }, {
        body: t.Object({
            bookId: t.Number(),
            count: t.Number()
        })
    })
    .post('/reserve', async ({ body, set, user }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        const { bookId, date } = body;

        try {
            await db.insertInto('library_reservations')
                .values({
                    book_id: bookId,
                    person_id: user.user_id,
                    reservation_date: new Date(date),
                    status: 'pending',
                    created: new Date()
                })
                .execute();

            return { message: "Book reserved successfully" };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { error: "Reservation failed" };
        }
    }, {
        body: t.Object({
            bookId: t.Number(),
            date: t.String()
        })
    })
    .post('/borrow', async ({ body, set, user }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        const { user_id, copyId } = body;

        // Transaction
        try {
            // Check availability
            const copy = await db.selectFrom('library_copies')
                .select(['status', 'book_id'])
                .where('copy_id', '=', copyId)
                .executeTakeFirst();

            if (!copy || copy.status !== 'available') {
                set.status = 400;
                return { error: "Copy not available" };
            }

            // Create Loan
            await db.insertInto('library_loans')
                .values({
                    copy_id: copyId,
                    reader_id: user_id,
                    loan_date: new Date(),
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
                    status: 'ongoing',
                    notes: ''
                })
                .execute();

            // Update Copy Status
            await db.updateTable('library_copies')
                .set({ status: 'checked_out' })
                .where('copy_id', '=', copyId)
                .execute();

            return { message: "Book borrowed successfully" };

        } catch (error) {
            console.error(error);
            set.status = 500;
            return { error: "Loan processing failed" };
        }
    }, {
        body: t.Object({
            user_id: t.Number(),
            copyId: t.Number()
        })
    })
    .post('/return', async ({ body, set, user }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        const { copyId } = body;

        try {
            // Find active loan for this copy
            const loan = await db.selectFrom('library_loans')
                .select(['loan_id', 'due_date'])
                .where('copy_id', '=', copyId)
                .where('status', '=', 'ongoing')
                .executeTakeFirst();

            if (!loan) {
                set.status = 404;
                return { error: "No active loan found for this copy" };
            }

            // Update Loan
            await db.updateTable('library_loans')
                .set({ 
                    status: 'returned',
                    return_date: new Date()
                })
                .where('loan_id', '=', loan.loan_id)
                .execute();

            // Update Copy Status
            await db.updateTable('library_copies')
                .set({ status: 'available' })
                .where('copy_id', '=', copyId)
                .execute();

            // Calculate late fee if applicable
            let lateFee = 0;
            if (new Date(loan.due_date) < new Date()) {
                const diffTime = Math.abs(new Date().getTime() - new Date(loan.due_date).getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const settings = await db.selectFrom('library_settings').selectAll().where('setting_id', '=', 1).executeTakeFirst();
                if (settings && Number(settings.late_fee_per_day) > 0) {
                    lateFee = diffDays * Number(settings.late_fee_per_day);
                }
            }

            return { message: "Book returned successfully", lateFee };

        } catch (error) {
            console.error(error);
            set.status = 500;
            return { error: "Return processing failed" };
        }
    }, {
        body: t.Object({
            copyId: t.Number()
        })
    });
