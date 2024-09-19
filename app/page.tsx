"use client"

import Image from 'next/image'
import Link from 'next/link'
import ViewCounter from '@/components/view-counter'
import { Suspense } from 'react'
import ExpandingArrow from '@/components/expanding-arrow'
import RegistrationForm from '@/components/RegistrationForm'

export const dynamic = 'force-dynamic'

function JiveLogo() {
  return (
    <Image
      src="/logo.jpg"
      alt="Jive Logo"
      width={36}
      height={36}
    />
  );
}

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
        <div className="flex justify-center items-center bg-black rounded-full w-16 sm:w-24 h-16 sm:h-24 my-8">
          <JiveLogo />
        </div>
        <h1 className="text-lg sm:text-2xl font-bold mb-2">
          Jive Tracker
        </h1>
        <h2 className="text-md sm:text-xl mx-4">
          Track your <a href="https://open.spotify.com/album/4ZiO4maXhoFYHXvYOU4UWb?si=0dPl1GLpTQeUsonONOdUoA" target="_blank" rel="noopener noreferrer" className="text-blue-500">Jive streams on Spotify</a> and compete on the leaderboard.
        </h2>
        <div className="flex flex-wrap items-center justify-around max-w-4xl my-8 sm:w-full bg-white rounded-md shadow-xl h-full border border-gray-100">
          <div className="mx-8 w-full mt-8">
            <h3 className="text-xl font-semibold mb-1">
              Track Your Stats
            </h3>
            <p className="mb-4">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const modal = document.getElementById('howItWorksModal') as HTMLDialogElement | null;
                  modal?.showModal();
                }}
                className="text-blue-500 hover:text-blue-600"
              >
                &nbsp;How does it work? &rarr;
              </a>
            </p>
            <dialog id="howItWorksModal" className="modal modal-bottom sm:modal-middle">
              <form method="dialog" className="modal-box">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">How does it work?</h3>
                  <button className="btn btn-sm btn-circle btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="py-4 text-left">
                  1. Connect your Solana wallet<br />
                  2. Link your Spotify account<br />
                  3. Start streaming Jive tracks<br />
                  4. Check the leaderboard to see your rank
                </p>
                <p className="py-4 text-left max-w-md">
                  Only the last two hours of streams are recorded. Make sure to revisit this site often to update your stats.
                  Only valid streams are counted, using farms will not count towards this leaderboard.
                </p>
              </form>
            </dialog>
            <RegistrationForm />
          </div>
          <hr className="border-1 border-gray-200 my-8 mx-8 w-full" />
          <div className="mx-8 w-full">
            <h3 className="text-xl font-semibold mb-4">
              Leaderboard
            </h3>
            {/* <Leaderboard /> */}
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p
                className="flex items-center my-8 w-full justify-center sm:justify-start text-gray-500"
              >
                Jive To Earn. Not affiliated with Spotify.
              </p>
              <p
                className="flex rounded focus:outline-none focus:ring focus:ring-blue-300 mb-4 sm:mb-0 min-w-max"
              >
                <a href="https://github.com/lesueurii/jivetracker" target="_blank" rel="noopener noreferrer" className="mr-4">
                  <svg className="w-6 h-6 text-gray-600 hover:text-gray-800" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://twitter.com/jive_to_earn" target="_blank" rel="noopener noreferrer" className="mr-4">
                  <svg className="w-6 h-6 text-gray-600 hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="https://t.me/jivesolana" target="_blank" rel="noopener noreferrer">
                  <svg className="w-6 h-6 text-gray-600 hover:text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function BackupHome() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <Link
        href="https://vercel.com/templates/next.js/kv-redis-starter"
        className="group mt-20 sm:mt-0 rounded-full flex space-x-1 bg-white/30 shadow-sm ring-1 ring-gray-900/5 text-gray-600 text-sm font-medium px-10 py-2 hover:shadow-lg active:shadow-sm transition-all"
      >
        <p>Deploy your own to Vercel</p>
        <ExpandingArrow />
      </Link>
      <h1 className="pt-4 pb-8 bg-gradient-to-br from-black via-[#171717] to-[#575757] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
        KV on Vercel
      </h1>
      <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
              Announcing Vercel KV for Redis
            </h2>
            <p className="text-sm text-gray-500">
              The best description in the world
            </p>
          </div>
          <Suspense>
            {/* @ts-expect-error Async Server Component */}
            <ViewCounter />
          </Suspense>
        </div>
        <div className="flex flex-col space-y-4">
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
          <p className="text-gray-600">
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
        </div>
      </div>
      <p className="font-light text-gray-600 w-full max-w-lg text-center mt-6">
        <Link
          href="https://vercel.com/kv"
          className="font-medium underline underline-offset-4 hover:text-black transition-colors"
        >
          Vercel KV for Redis
        </Link>{' '}
        demo. Built with{' '}
        <Link
          href="https://nextjs.org/docs"
          className="font-medium underline underline-offset-4 hover:text-black transition-colors"
        >
          Next.js App Router
        </Link>
        .
      </p>
      <div className="sm:absolute sm:bottom-0 w-full px-20 py-10 flex justify-between">
        <Link href="https://vercel.com">
          <Image
            src="/vercel.svg"
            alt="Vercel Logo"
            width={100}
            height={24}
            priority
          />
        </Link>
        <Link
          href="https://github.com/vercel/examples/tree/main/storage/kv-redis-starter"
          className="flex items-center space-x-2"
        >
          <Image
            src="/github.svg"
            alt="GitHub Logo"
            width={24}
            height={24}
            priority
          />
          <p className="font-light">Source</p>
        </Link>
      </div>
    </main>
  )
}
