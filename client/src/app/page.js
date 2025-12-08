"use client"
import { NAV_LINKS, HOW_IT_WORKS, FAQ, SERVICES_TEXT, HERO} from "../components/Constants.js"
import {Menu, X, CircleCheckBig} from "lucide-react"
import { useState } from "react"

import Image from "next/image"
import Link from "next/link"
import React from 'react'
import ContactUs from "../components/contactus2";
import Footer from "../components/Footer";



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
     <nav className='fixed top-2 z-50 w-screen px-4' role="navigation" aria-label="Main navigation">
      <div className='container mx-auto flex items-center justify-between rounded-lg backdrop-blur-3xl min-h-[40px] bg-black/30 px-4 py-3 shadow-md'>
        <div className='flex items-center gap-3'>
          <Link href="#" className='flex items-center gap-2'>
            <Image 
              className='mr-2'
              src="/logo.png"
              width={28}
              height={28}
              alt="Logo"
            />
            <span className='text-sm tracking-tight text-white font-semibold'>BUDDHI</span>
          </Link>
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-8">
          <ul className="flex items-center gap-6" aria-hidden={mobileDrawerOpen}>
                    {NAV_LINKS.map((item, index) => (
                      <li key={index}>
                        <Link 
                          className="text-sm text-white hover:text-neutral-300"
                          href={item.url}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
            >
              Log In
            </Link>
            <Link
              href="/request"
              className="ml-0 rounded-md bg-white/90 px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
            >
              Request form
            </Link>
          </div>
        </div>

        <div className="flex lg:hidden items-center">
          <button
            onClick={toggleNavbar}
            aria-expanded={mobileDrawerOpen}
            aria-controls="mobile-nav"
            className="text-white p-2 rounded-md"
          >
            {mobileDrawerOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileDrawerOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40" onClick={() => setMobileDrawerOpen(false)}>
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div id="mobile-nav" className="fixed top-16 left-4 right-4 z-50 bg-black/95 rounded-lg p-6">
            <ul className="flex flex-col items-start gap-4">
              {NAV_LINKS.map((item, index) => (
                <li key={index} className="w-full">
                  <Link 
                    className="block w-full text-base text-white hover:text-neutral-300 py-2"
                    href={item.url}
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/login"
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 text-center"
                onClick={() => setMobileDrawerOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/request"
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 text-center"
                onClick={() => setMobileDrawerOpen(false)}
              >
                Request form
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>

    {/* Hero Section */}
      <section className='hero flex min-h-screen items-center' aria-labelledby="hero-heading">
        <div className='container mx-auto px-6 md:px-12 lg:px-20'>
          <div className='flex flex-col-reverse lg:flex-row items-center gap-12'>
            {/* Left: Text */}
            <div className='w-full lg:w-1/2'>
              <h1 id="hero-heading" className='mb-4 text-4xl text-white md:text-5xl lg:text-6xl font-bold'>
                {HERO.title}
              </h1>

              <p className='mb-6 text-lg text-slate-300 max-w-2xl'>
                {HERO.description}
              </p>

              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                <Link href="/request" className='inline-block rounded-md bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200'>
                  Request Demo
                </Link>

                <Link href="/login" className='inline-block rounded-md border border-white/30 px-5 py-3 text-sm text-white hover:bg-white/5'>
                  Get Started
                </Link>
              </div>
            </div>

            {/* Right: Visual */}
            <div className='w-full lg:w-1/2 flex justify-center lg:justify-end'>
              <div className='rounded-2xl overflow-hidden shadow-2xl bg-white/5 border border-white/6'>
                <Image
                  src="/image4.jpg"
                  alt="BUDDHI dashboard preview"
                  width={520}
                  height={360}
                  className='object-cover w-full h-full block'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

    {/* How it Works */}

    <section id="how-it-works" className="bg-white py-20">
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
              src="/image4.jpg" 
              alt="How it works illustration"
              width={500}
              height={500}
              className="rounded-2xl shadow-md object-cover"
            />
          </div>
        </div>
      </div>
    </section>

    {/* Features / Modules Section (generated from project controllers) */}
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Core <span style={{ color: 'var(--primary)' }}>Features</span>
          </h2>
          
        </div>

        {/* Generate features based on detected controllers */}
        {(() => {
          const FEATURES = [
            { id: 'healthCheck', title: 'Health Check', desc: 'Server health and diagnostics endpoints.', url: '/health' },
            { id: 'student', title: 'Student Management', desc: 'Student registration, profiles and portals.', url: '/student' },
            { id: 'registration', title: 'Registration', desc: 'Course and student registrations.', url: '/registration' },
            { id: 'admitCard', title: 'Admit Cards', desc: 'Generate and download admit cards.', url: '/admit-card' },
            { id: 'gradeCard', title: 'Exams & Grades', desc: 'Exam management and grade cards.', url: '/grade-card' },
            { id: 'attendance', title: 'Attendance', desc: 'Timetable and attendance tracking.', url: '/attendance' },
            { id: 'monthlyAttendance', title: 'Monthly Attendance', desc: 'Monthly attendance summaries and reports.', url: '/monthly-attendance' },
            { id: 'studyMaterial', title: 'Study Material', desc: 'Upload, categorize and download materials.', url: '/study-material' },
            { id: 'course', title: 'Courses', desc: 'Course catalog and curriculum management.', url: '/courses' },
            { id: 'department', title: 'Departments', desc: 'Department-level configuration and listing.', url: '/departments' },
            { id: 'faculty', title: 'Faculty', desc: 'Faculty profiles and assignments.', url: '/faculty' },
            { id: 'feePayment', title: 'Fees & Payments', desc: 'Fee collection and Razorpay transactions.', url: '/fee-payment' },
            { id: 'hostel', title: 'Hostel Management', desc: 'Hostel applications and room allocations.', url: '/hostel' },
            { id: 'notice', title: 'Notices & Announcements', desc: 'Publish notices and announcements.', url: '/notices' },
            { id: 'razorpay', title: 'Razorpay', desc: 'Payment gateway integrations and transactions.', url: '/razorpay' },
            { id: 'subAdmin', title: 'Sub-Admins', desc: 'Sub-admin accounts and permissions.', url: '/sub-admins' },
            { id: 'superAdmin', title: 'Super Admin', desc: 'Super admin controls and global settings.', url: '/super-admin' },
            { id: 'admin', title: 'Admin & Staff', desc: 'University administration and staff tools.', url: '/admin' },
          ]

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map(feature => (
                <div key={feature.id} className="bg-white rounded-lg border p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="mb-3">
                      <span className="inline-block bg-slate-800 text-white text-xs px-3 py-1 rounded-full">{feature.title.split(' ')[0]}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Link href={feature.url} className="text-sm text-neutral-700 hover:text-neutral-900">Open</Link>
                    <CircleCheckBig className="w-5 h-5 text-green-500" />
                  </div>
                </div>  
              ))}
            </div>
          )
        })()}
      </div>
    </section>

    {/* services Section */}
     <div id="services" className='max-w-6xl mx-auto my-12 px-4'>
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

    {/* Request to Register Section */}
    <section id="request" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <ContactUs />
      </div>
    </section>

    <Footer />

    </>
  )
}

export default Homepage