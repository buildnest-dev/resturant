import { DemoForm } from '@/components/DemoForm'
import { Footer, Header } from '@/components/Site'

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string | string[] }> }) {
  const { plan } = await searchParams
  const initialPlan = plan === 'Yearly' ? 'Yearly' : 'Monthly'
  return (
    <div>
      <Header />
      <DemoForm key={initialPlan} initialPlan={initialPlan} />
      <Footer />
    </div>
  )
}
