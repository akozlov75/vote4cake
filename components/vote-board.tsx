'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import type { Cake } from '@/lib/cakes'

type VoteBoardProps = {
  cakes: Cake[]
  initialVotes: Record<string, number>
}

const HAS_VOTED_STORAGE_KEY = 'vote4cake:hasVoted'
const SELECTED_CAKE_STORAGE_KEY = 'vote4cake:selectedCake'

async function fetchVotes(): Promise<Record<string, number>> {
  const response = await fetch('/api/votes', { cache: 'no-store' })

  if (!response.ok) {
    throw new Error('Failed to fetch votes')
  }

  const data = (await response.json()) as { votes?: Record<string, number> }
  return data.votes ?? {}
}

export function VoteBoard({ cakes, initialVotes }: VoteBoardProps) {
  const [votes, setVotes] = useState<Record<string, number>>(initialVotes)
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedCakeId, setSelectedCakeId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    setHasVoted(window.localStorage.getItem(HAS_VOTED_STORAGE_KEY) === 'true')
    setSelectedCakeId(window.localStorage.getItem(SELECTED_CAKE_STORAGE_KEY))
  }, [])

  const votedCake = selectedCakeId
    ? cakes.find((cake) => cake.id === selectedCakeId)
    : undefined

  const uiMessage = useMemo(() => {
    if (statusMessage.length > 0) {
      return statusMessage
    }

    if (!hasVoted) {
      return 'Tap a cake to submit your vote.'
    }

    return `Vote accepted for ${votedCake?.name}.`
  }, [hasVoted, statusMessage, votedCake?.name])

  useEffect(() => {
    let active = true

    const syncVotes = async () => {
      try {
        const latestVotes = await fetchVotes()

        if (active) {
          setVotes(latestVotes)
          if (!hasVoted) {
            setStatusMessage('')
          }
        }
      } catch {
        if (active) {
          setStatusMessage('Vote service is temporarily unavailable.')
        }
      }
    }

    const intervalId = window.setInterval(syncVotes, 5000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [hasVoted])

  const handleVote = async (cakeId: string) => {
    if (hasVoted || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cakeId }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit vote')
      }

      setSelectedCakeId(cakeId)
      setHasVoted(true)
      window.localStorage.setItem(HAS_VOTED_STORAGE_KEY, 'true')
      window.localStorage.setItem(SELECTED_CAKE_STORAGE_KEY, cakeId)

      const latestVotes = await fetchVotes()
      setVotes(latestVotes)
      setStatusMessage('')
    } catch {
      setStatusMessage('Could not submit vote right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="cake-grid" role="list" aria-label="Cake options">
        {cakes.map((cake) => {
          const isSelected = selectedCakeId === cake.id
          const cardClassName = [
            'cake-card',
            hasVoted && isSelected ? 'cake-card-selected' : '',
            hasVoted && !isSelected ? 'cake-card-faded' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={cake.id}
              type="button"
              className={cardClassName}
              onClick={() => void handleVote(cake.id)}
              disabled={hasVoted || isSubmitting}
              role="listitem"
            >
              <Image src={cake.imageUrl} alt={cake.name} width={900} height={600} />
              <span>{`${cake.name} (${votes[cake.id] ?? 0})`}</span>
            </button>
          )
        })}
      </div>

      <p className="status" role="status">
        {uiMessage}
      </p>
    </>
  )
}
