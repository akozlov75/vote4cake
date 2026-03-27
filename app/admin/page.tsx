import { CAKES } from "@/lib/cakes";
import { getVotesSnapshot } from "@/lib/vote-store";
import { AdminAutoRefresh } from "@/components/admin-auto-refresh";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{
    reset?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const resolvedSearchParams = await searchParams;
  const votes = await getVotesSnapshot();
  const wasReset = resolvedSearchParams?.reset === "1";

  const rows = CAKES.map((cake) => ({
    id: cake.id,
    name: cake.name,
    count: votes[cake.id] ?? 0,
  }));

  const totalVotes = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <main className="app">
      <AdminAutoRefresh />
      <section className="panel vote-panel">
        <p className="eyebrow">Vote4Cake Admin</p>
        <h1>Vote counts</h1>
        <p className="lead">Protected dashboard for watching current results.</p>

        {wasReset ? <p className="status">Vote counts were reset.</p> : null}

        <ul aria-label="Vote counts by cake">
          {rows.map((row) => (
            <li key={row.id}>{`${row.name}: ${row.count}`}</li>
          ))}
        </ul>

        <p className="status" role="status">{`Total votes: ${totalVotes}`}</p>

        <form action="/admin/reset" method="post">
          <button type="submit">Reset all votes</button>
        </form>
      </section>
    </main>
  );
}
