import { redirect } from 'next/navigation'

// unknown addresses go back to the home page
export default function Page() {
  redirect('/')
}
