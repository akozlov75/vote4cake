import { VoteBoard } from '@/components/vote-board'
import { CAKES } from '@/lib/cakes'
import { getVotesSnapshot } from '@/lib/vote-store'

export default async function Page() {
  const votes = getVotesSnapshot()

  return (
    <main className="app">
      <section className="panel vote-panel">
        <p className="eyebrow">Vote4Cake</p>
        <h1>Vote for your favorite</h1>
        <p className="lead">Select one cake card to cast your vote.</p>
        <VoteBoard cakes={CAKES} initialVotes={votes} />
      </section>
    </main>
  )
}
