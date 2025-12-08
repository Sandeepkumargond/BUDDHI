import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { NAV_LINKS } from './Constants.js'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-10">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <Image src="/logo.png" width={40} height={40} alt="BUDDHI" />
            <div>
              <div className="text-lg font-semibold">BUDDHI</div>
              <div className="text-sm text-slate-300 max-w-sm">A lightweight university management skeleton — student, exams, attendance, fees and more.</div>
            </div>
          </div>

          <nav className="hidden md:flex space-x-6">
            {NAV_LINKS && NAV_LINKS.map((link, idx) => (
              <Link key={idx} href={link.url} className="text-sm text-slate-300 hover:text-white">
                {link.title}
              </Link>
            ))}
          </nav>
        </div>

        <hr className="my-6 border-slate-700" />

        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-400">
          <p>© {new Date().getFullYear()} BUDDHI. All rights reserved.</p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <a href="mailto:contact@buddhi.example" className="hover:text-white">contact@buddhi.example</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
