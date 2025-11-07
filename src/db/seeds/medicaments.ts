import { db } from '@/db';
import { medicaments } from '@/db/schema';

async function main() {
    const now = new Date().toISOString();
    
    const sampleMedicaments = [
        {
            nom: 'Paracétamol',
            prix: 5.50,
            quantite: 100,
            dateExpiration: '2025-12-31',
            createdAt: now,
            updatedAt: now,
        },
        {
            nom: 'Ibuprofène',
            prix: 7.80,
            quantite: 75,
            dateExpiration: '2025-10-15',
            createdAt: now,
            updatedAt: now,
        },
        {
            nom: 'Aspirine',
            prix: 4.20,
            quantite: 120,
            dateExpiration: '2026-03-20',
            createdAt: now,
            updatedAt: now,
        },
        {
            nom: 'Amoxicilline',
            prix: 12.50,
            quantite: 50,
            dateExpiration: '2025-08-30',
            createdAt: now,
            updatedAt: now,
        },
        {
            nom: 'Doliprane',
            prix: 6.00,
            quantite: 90,
            dateExpiration: '2026-01-10',
            createdAt: now,
            updatedAt: now,
        }
    ];

    await db.insert(medicaments).values(sampleMedicaments);
    
    console.log('✅ Medicaments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});