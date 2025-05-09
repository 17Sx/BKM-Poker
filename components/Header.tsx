import Link from 'next/link'
import Button from './ui/button'
import dynamic from "next/dynamic";

const GooeyNav = dynamic(() => import("./ui/GooeyNav"), { ssr: false });

export default function Header() {
  return (
    <header className="fixed top-5 left-0 right-0 z-50">
      <div className="container mx-auto px-4 backdrop-blur-sm rounded-full p-2">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-white text-xl font-bold opacity-80">
            BKM
          </Link>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <GooeyNav items={[
              {
                label: "Home",
                href: "/",
              },
              {
                label: "Dashboard",
                href: "/dashboard",
              },
              {
                label: "History",
                href: "/history",
              },
              {
                label: "About",
                href: "/about",
              },
            ]} />
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button className='max-h-8' variant="secondary">Login</Button>
            </Link>
            <Link href="/auth?signup=true">
              <Button className='max-h-8'  variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
