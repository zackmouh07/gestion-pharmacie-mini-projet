import { db } from '@/db';
import { medicaments } from '@/db/schema';

async function main() {
    const sampleMedicaments = [
        {
            nom: 'Amoxicilline 500mg',
            prix: 12.50,
            quantite: 150,
            dateExpiration: '2026-08-15',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            nom: 'Azithromycine 250mg',
            prix: 14.90,
            quantite: 75,
            dateExpiration: '2026-11-30',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            nom: 'Ciprofloxacine 500mg',
            prix: 9.80,
            quantite: 45,
            dateExpiration: '2025-09-22',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            nom: 'Paracétamol 1000mg',
            prix: 3.50,
            quantite: 200,
            dateExpiration: '2027-03-10',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            nom: 'Ibuprofène 400mg',
            prix: 5.20,
            quantite: 180,
            dateExpiration: '2026-12-18',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            nom: 'Doliprane 500mg',
            prix: 4.30,
            quantite: 160,
            dateExpiration: '2027-05-25',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            nom: 'Vitamine D3 2000UI',
            prix: 8.90,
            quantite: 95,
            dateExpiration: '2026-06-14',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            nom: 'Vitamine C 1000mg',
            prix: 6.70,
            quantite: 120,
            dateExpiration: '2027-01-28',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            nom: 'Cétirizine 10mg',
            prix: 5.80,
            quantite: 85,
            dateExpiration: '2026-10-05',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            nom: 'Oméprazole 20mg',
            prix: 11.50,
            quantite: 60,
            dateExpiration: '2025-12-20',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    await db.insert(medicaments).values(sampleMedicaments);
    
    console.log('✅ Medicaments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});