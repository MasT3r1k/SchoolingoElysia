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

export const library = new Elysia({ prefix: '/library' })
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
                    .whereRef('library_copies.bookId', '=', 'library_books.bookId')
                    .where('status', '=', 'available')
                    .select(eb.fn.countAll<number>().as('count'))
                    .as('available_copies'),
                eb.selectFrom('library_copies')
                    .whereRef('library_copies.bookId', '=', 'library_books.bookId')
                    .select(eb.fn.countAll<number>().as('count'))
                    .as('total_copies')
            ])
            .orderBy('createdAt', 'desc')
            .execute();
    })
    .post('/books', async ({ body, set, user }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        try {
            const { copies, ...bookData } = body;
            
            // Insert Book
            const result = await db.insertInto('library_books')
                .values({
                    ...bookData,
                    createdAt: new Date()
                })
                .executeTakeFirst();
            
            const bookId = Number(result.insertId);

            // Insert Copies if requested
            if (copies && copies > 0) {
                const copiesData = Array.from({ length: copies }).map((_, i) => ({
                    bookId: bookId,
                    copyNumber: i + 1,
                    status: 'available' as const,
                    condition: 'new',
                    shelfLocation: 'Reception' // Default location
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
            .innerJoin('library_copies', 'library_copies.copyId', 'library_loans.copyId')
            .innerJoin('library_books', 'library_books.bookId', 'library_copies.bookId')
            .select(['library_loans.loanId', 'library_loans.dueDate', 'library_loans.status', 'library_loans.loanDate',
                     'library_books.title', 'library_books.author', 'library_books.coverUrl'])
            .where('borrowerId', '=', user.user_id)
            .where('library_loans.status', '=', 'ongoing')
            .orderBy('dueDate', 'asc')
            .execute();
    })
    .post('/copies', async ({ body, set, user }: any) => {
        if (!user) { set.status = 401; return { error: "Unauthorized" }; }
        try {
            const { bookId, count } = body;
            const copiesData = Array.from({ length: count }).map((_, i) => ({
                bookId: bookId,
                copyNumber: 0, // Should calculate max copy number... simplification for now or auto-increment if copyId is distinct
                status: 'available' as const,
                condition: 'new',
                shelfLocation: 'Reception'
            }));
            
            // Note: Simplification. Ideally we fetch max copyNumber for the book first.
            
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
        const { userId, copyId } = body;

        // Transaction
        try {
            // Check availability
            const copy = await db.selectFrom('library_copies')
                .select(['status', 'bookId'])
                .where('copyId', '=', copyId)
                .executeTakeFirst();

            if (!copy || copy.status !== 'available') {
                set.status = 400;
                return { error: "Copy not available" };
            }

            // Create Loan
            await db.insertInto('library_loans')
                .values({
                    copyId,
                    borrowerId: userId, // Mapped to borrowerId
                    loanDate: new Date(),
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
                    status: 'ongoing'
                })
                .execute();

            // Update Copy Status
            await db.updateTable('library_copies')
                .set({ status: 'checked_out' })
                .where('copyId', '=', copyId)
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
                .select('loanId')
                .where('copyId', '=', copyId)
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
                    returnDate: new Date()
                })
                .where('loanId', '=', loan.loanId)
                .execute();

            // Update Copy Status
            await db.updateTable('library_copies')
                .set({ status: 'available' })
                .where('copyId', '=', copyId)
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
