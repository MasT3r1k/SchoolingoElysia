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
    .get('/lookup', async ({ query, set, user }: any) => {
        if (!user) {
            set.status = 401;
            return { error: "Unauthorized" };
        }
        
        const isbn = query.isbn;
        
        if (!isbn) {
            set.status = 400;
            return { error: "ISBN is required" };
        }

        try {
            const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
            
            if (!response.ok) {
                set.status = 502;
                return { error: "Failed to fetch from Open Library" };
            }

            const data = await response.json() as Record<string, OpenLibraryBook>;
            const bookKey = `ISBN:${isbn}`;
            const bookData = data[bookKey];

            if (!bookData) {
                set.status = 404;
                return { error: "Book not found" };
            }

            // Normalize Data
            return {
                isbn: isbn,
                title: bookData.title,
                author: bookData.authors?.map(a => a.name).join(", ") || "",
                publisher: bookData.publishers?.[0]?.name || "",
                published_year: bookData.publish_date ? parseInt(bookData.publish_date.match(/\d{4}/)?.[0] || "0") : null,
                pages: bookData.number_of_pages || null,
                description: bookData.excerpts?.[0]?.text || bookData.notes || "",
                coverUrl: bookData.cover?.large || bookData.cover?.medium || null,
            };

        } catch (error) {
            console.error("Open Library Lookup Error:", error);
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    }, {
        query: t.Object({
            isbn: t.String()
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
                    .as('total_copies')
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
                    isbn: body.isbn,
                    publisher: body.publisher,
                    published_year: published_year,
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
                .select('loan_id')
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

            return { message: "Book returned successfully" };

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
