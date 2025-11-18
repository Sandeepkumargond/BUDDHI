"use client"
import { NAV_LINKS, HOW_IT_WORKS, FAQ, SERVICES_TEXT, HERO} from "../components/Constants.js"
import {Menu, X, CircleCheckBig} from "lucide-react"
import { useState } from "react"

import Image from "next/image"
import Link from "next/link"
import React from 'react'



const Homepage = () => {
   const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    const toggleNavbar = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    }

    const lines = SERVICES_TEXT.split("\n").map(l => l.trim()).filter(Boolean)


  const services = lines.map(line => {
    const clean = line.replace(/^[^A-Za-z0-9]*/g, "")
    const parts = clean.split(":")
    if (parts.length > 1) {
      return { title: parts[0].trim(), desc: parts.slice(1).join(":").trim() }
    }
    return { title: null, desc: clean }
  })
   const paragraph = services
    .map(s => (s.title ? `${s.title} — ${s.desc}` : s.desc))
    .join(" ")
  return (
    <>
     <nav className='fixed top-2 z-50 w-screen px-4'>
        <div className='container flex items-center justify-between rounded-lg backdrop-blur-3xl min-h-[30px] bg-black/30 px-6 py-3 shadow-md'>
            <div className='flex flex-shrink-0 items-center justify-between'>
                <Image 
                className='mr-2'
                src="/home.png"
                width={20}
                height={20}
                alt="Logo"
                />
                <span className='text-sm tracking-tight text-white'>BUDDHI</span>

                </div>
                <div className="hidden lg:flex">
                    <ul className="flex items-center gap-4">
                        {NAV_LINKS.map((item, index) => (
                            <li key={index}>
                                <Link 
                                className="text-sm text-white hover:text-neutral-500"
                                href={item.url}
                                >
                                    {item.title}
                                </Link>
                            </li>
                        ))}
                    </ul>

                </div>

                <div className="hidden lg:flex">
                    <Link
                      href="/login"
                      className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
                    >
                      Log In
                    </Link>
                </div>

                <div className="flex-col justify-end text-white md:flex lg:hidden">
                    <button onClick={toggleNavbar}>
                        {mobileDrawerOpen ? <X /> : <Menu />}
                    </button>
                </div>

        </div>

        {mobileDrawerOpen && (
            <div className="rounded-md bg-black lg:hidden">
                <ul className=" flex flex-col items-center">
                    {NAV_LINKS.map((item, index) => (
                        <li key={index} className="py-6">
                            <Link 
                            className="text-sm text-white hover:text-neutral-500" href={item.url}
                            >
                                {item.title}
                            </Link>
                            </li>

                    ))}
                </ul>

                <div className="flex items-center justify-center pb-8 lg:hidden">
                    <Link
                      href="/login"
                      className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
                    >
                      Log In
                    </Link>
                </div>
            </div>
        )}
    </nav>

    {/* Hero Section */}
      <div className='hero flex min-h-screen items-center justify-center'>
        <div className='flex max-w-4xl flex-col items-center gap-6 pb-10'>
            <div className='space-y-4'>
                <h1 className='m-4 text-center text-4xl text-white md:text-5xl lg:text-6xl'>
                    {HERO.title}
                </h1>
                <p className='p-4 text-center text-slate-300'>
                    {HERO.description}
                </p>

            </div>
        </div>
      
    </div>

    {/* How it Works */}

    <section className="bg-white py-20">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {HOW_IT_WORKS.title}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            {HOW_IT_WORKS.content}
          </p>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Left: Steps Section */}
          <div className="flex-1 bg-gray-200 p-8 rounded-2xl border border-gray-200 shadow-sm">
            {HOW_IT_WORKS.steps.map((step, index) => (
              <div
                key={index}
                className="mb-8 last:mb-0 flex items-start gap-4"
              >
                <div className="mt-1">
                  <CircleCheckBig className="text-green-500 w-7 h-7" />
                </div>
                <div>
                  <h6 className="text-lg font-semibold text-gray-800 uppercase tracking-wide">
                    {step.title}
                  </h6>
                  <p className="text-gray-600 mt-1">{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Image Section */}
          <div className="flex-1 flex justify-center">
            <Image
              src="/image4.jpg" // 👈 replace with your image path
              alt="How it works illustration"
              width={500}
              height={500}
              className="rounded-2xl shadow-md object-cover"
            />
          </div>
        </div>
      </div>
    </section>

    {/* services Section */}
     <div className='max-w-6xl mx-auto my-12 px-4'>
      <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
        Services
      </h2>

      <div className="flex flex-col lg:flex-row items-start gap-8">
        <div className="w-full lg:w-1/2">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <Image
              className='w-full h-80 object-cover'
              src="/image3.jpg"
              width={1200}
              height={800}
              alt="services"
            />
          </div>
        </div>

        <div className="w-full lg:w-1/2">
         <div className="bg-white/5 dark:bg-black/40 border border-white/6 rounded-lg p-6 shadow-sm h-full flex items-center">
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {paragraph}
            </p>
          </div>
        </div>
      </div>
    </div>

    </>
  )
}

export default Homepage