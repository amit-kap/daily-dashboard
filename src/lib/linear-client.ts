import { LinearClient } from '@linear/sdk'

const apiKey = import.meta.env.VITE_LINEAR_API_KEY

export const linearClient = apiKey ? new LinearClient({ apiKey }) : null
