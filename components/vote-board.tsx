'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import type { Cake } from '@/lib/cakes'
import type { VoteClientData } from '@/lib/vote-store'

type VoteBoardProps = {
  cakes: Cake[]
  initialVotes: Record<string, number>
}

async function fetchVotes(): Promise<VoteClientData> {
  const response = await fetch('/api/votes', { cache: 'no-store' })

  if (!response.ok) {
    throw new Error('Failed to fetch votes')
  }

  return (await response.json()) as VoteClientData
}

export function VoteBoard({ cakes, initialVotes }: VoteBoardProps) {
  const [userId, setUserId] = useState('')
  const [votes, setVotes] = useState<Record<string, number>>(initialVotes)
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedCakeId, setSelectedCakeId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const votedCake = selectedCakeId
    ? cakes.find((cake) => cake.id === selectedCakeId)
    : undefined

  const uiMessage = useMemo(() => {
    if (statusMessage.length > 0) {
      return statusMessage
    }

    if (!isReady) {
      return 'Loading vote status...'
    }

    if (!hasVoted) {
      return 'Tap a cake to submit your vote.'
    }

    return `Vote accepted for ${votedCake?.name}.`
  }, [hasVoted, isReady, statusMessage, votedCake?.name])

  useEffect(() => {
    let active = true

    const syncVotes = async () => {
      try {
        const data = await fetchVotes()

        if (active) {
          setUserId(data.user.userId)
          setVotes(data.votes)
          setHasVoted(data.user.hasVoted)
          setSelectedCakeId(data.user.selectedCakeId)
          setIsReady(true)

          if (!hasVoted) {
            setStatusMessage('')
          }
        }
      } catch {
        if (active) {
          setIsReady(true)
          setStatusMessage('Vote service is temporarily unavailable.')
        }
      }
    }

    void syncVotes()
    const intervalId = window.setInterval(syncVotes, 5000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [hasVoted])

  const handleVote = async (cakeId: string) => {
    if (!isReady || !userId || hasVoted || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cakeId }),
      })

      const data = (await response.json().catch(() => null)) as VoteClientData & {
        error?: string
      } | null

      if (!data) {
        throw new Error('Failed to submit vote')
      }

      setUserId(data.user.userId)
      setVotes(data.votes)
      setHasVoted(data.user.hasVoted)
      setSelectedCakeId(data.user.selectedCakeId)

      if (!response.ok) {
        setStatusMessage(data.error ?? 'You have already voted.')
        return
      }

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
              disabled={!isReady || hasVoted || isSubmitting}
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
