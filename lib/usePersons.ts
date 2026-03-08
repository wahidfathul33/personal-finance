'use client'

import { useState, useEffect } from 'react'
import { getPersons } from '@/actions/persons'
import type { Person } from '@/lib/types'

let cache: Person[] | null = null
let inflight: Promise<Person[]> | null = null

export function usePersons(): Person[] {
  const [persons, setPersons] = useState<Person[]>(cache ?? [])

  useEffect(() => {
    if (cache) {
      setPersons(cache)
      return
    }
    if (!inflight) {
      inflight = getPersons()
    }
    inflight.then((list) => {
      cache = list
      inflight = null
      setPersons(list)
    })
  }, [])

  return persons
}

export function invalidatePersonsCache() {
  cache = null
  inflight = null
}
