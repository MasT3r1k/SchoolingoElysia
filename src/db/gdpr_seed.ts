import { db } from '../../database';

async function seed() {
    console.log('--- SEEDING GDPR DATA ---');

    // Consents
    await db.insertInto('gdpr_consents')
        .values([
            {
                title: 'Zpracování osobních údajů pro školní účely',
                type: 'essential',
                description: 'Nezbytné údaje pro provoz informačního systému.',
                purpose: 'Zajištění výuky a správa studentů.',
                instructions: 'Tento souhlas je vyžadován zákonem.',
                required: true,
                active: true,
                target_group: 'all'
            },
            {
                title: 'Zasílání newsletteru a novinek',
                type: 'marketing',
                description: 'Informace o dění ve škole, akcích a kroužcích.',
                purpose: 'Informovanost rodičů a studentů.',
                instructions: 'Můžete kdykoliv odvolat.',
                required: false,
                active: true,
                target_group: 'parents'
            },
            {
                title: 'Sdílení fotografií z akcí',
                type: 'third_party',
                description: 'Zveřejňování fotografií na webu školy a sociálních sítích.',
                purpose: 'Prezentace školy.',
                instructions: 'Souhlas se vztahuje na hromadné fotografie.',
                required: false,
                active: true,
                target_group: 'all'
            }
        ])
        .execute();

    // Training
    await db.insertInto('gdpr_training')
        .values([
            {
                name: 'Základy GDPR pro zaměstnance',
                description: 'Povinné školení ohledně nakládání s osobními údaji.',
                valid_days: 365,
                active: true,
                target_group: 'teachers'
            },
            {
                name: 'Bezpečnost dat v IS Schoolingo',
                description: 'Jak bezpečně pracovat s informačním systémem.',
                valid_days: 180,
                active: true,
                target_group: 'all'
            }
        ])
        .execute();

    // Reviews (Audits)
    await db.insertInto('gdpr_reviews')
        .values([
            {
                title: 'Roční audit datové bezpečnosti 2025',
                description: 'Celkové prověření procesů nakládání s daty.',
                date: new Date('2025-01-15'),
                status: 'completed',
                result: 'Vše v pořádku, žádné kritické nálezy.'
            },
            {
                title: 'Prověření fyzického zabezpečení serverovny',
                description: 'Kontrola přístupových systémů a kamer.',
                date: new Date('2025-03-20'),
                status: 'planned'
            }
        ])
        .execute();

    console.log('--- SEEDING GDPR DATA FINISHED ---');
    process.exit(0);
}

seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
