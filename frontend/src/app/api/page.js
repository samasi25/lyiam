import { fetchSportData } from '@/lib/sportmonks';

export default async function Home() {
    const data = await fetchSportData('football/leagues');

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Football Leagues</h1>
            {data?.data ? (
                <ul className="mt-4 space-y-2">
                    {data.data.map((league) => (
                        <li key={league.id} className="p-2 border rounded">
                            {league.name}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Failed to load data.</p>
            )}
        </div>
    );
}
