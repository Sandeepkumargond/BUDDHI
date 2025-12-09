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

    <section id="how-it-works" className="bg-gradient-to-b from-gray-50 to-white py-20">
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

        {/* Horizontal Flow Diagram */}
        <div className="relative">
          {/* Desktop View - Horizontal */}
          <div className="hidden md:block">
            <div className="flex items-start justify-between relative">
              {/* Connection Line */}
              <div className="absolute top-16 left-0 right-0 h-1" style={{ zIndex: 0, backgroundColor: '#E2F3F8' }}></div>
              
              {HOW_IT_WORKS.steps.map((step, index) => {
                const colors = ['#AEE7F7', '#C9CCFF', '#F9DB66'];
                const bgColor = colors[index % 3];
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center relative" style={{ zIndex: 1 }}>
                    {/* Circle Step */}
                    <div 
                      className="w-32 h-32 rounded-full flex items-center justify-center font-bold text-3xl mb-6 transition-all hover:scale-110"
                      style={{ 
                        backgroundColor: bgColor,
                        color: '#ffffff',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {index + 1}
                    </div>
                    
                    {/* Step Content */}
                    <div className="text-center px-4">
                      <h6 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
                        {step.title}
                      </h6>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {step.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile View - Vertical */}
          <div className="md:hidden space-y-8">
            {HOW_IT_WORKS.steps.map((step, index) => {
              const colors = ['#AEE7F7', '#C9CCFF', '#F9DB66'];
              const bgColor = colors[index % 3];
              
              return (
                <div key={index} className="flex items-start gap-6">
                  {/* Circle Step */}
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0"
                    style={{ 
                      backgroundColor: bgColor,
                      color: '#ffffff',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {index + 1}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 pt-2">
                    <h6 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
                      {step.title}
                    </h6>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>
              );
            })}
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
            { 
              id: 'student', 
              title: 'Student Management', 
              desc: 'Complete student lifecycle management including registration, profiles, portals, admit cards, and grade cards.',
              subFeatures: ['Registration', 'Student Profiles', 'Admit Cards', 'Grade Cards'],
              url: '/student' 
            },
            { 
              id: 'attendance', 
              title: 'Attendance & Tracking', 
              desc: 'Comprehensive attendance management with daily tracking, monthly reports, and automated summaries.',
              subFeatures: ['Daily Attendance', 'Monthly Reports', 'Timetable Management'],
              url: '/attendance' 
            },
            { 
              id: 'academics', 
              title: 'Academic Resources', 
              desc: 'Centralized platform for courses, study materials, curriculum management, and department organization.',
              subFeatures: ['Courses', 'Study Materials', 'Departments', 'Curriculum'],
              url: '/courses' 
            },
            { 
              id: 'faculty', 
              title: 'Faculty Management', 
              desc: 'Faculty profiles, assignments, course allocations, and teaching resource management.',
              subFeatures: ['Faculty Profiles', 'Course Assignments', 'Teaching Resources'],
              url: '/faculty' 
            },
            { 
              id: 'feePayment', 
              title: 'Fees & Payments', 
              desc: 'Integrated fee collection system with Razorpay gateway, payment tracking, and transaction management.',
              subFeatures: ['Fee Collection', 'Payment Gateway', 'Transaction History'],
              url: '/fee-payment' 
            },
            { 
              id: 'hostel', 
              title: 'Hostel & Facilities', 
              desc: 'Complete hostel management including applications, room allocations, and facility maintenance.',
              subFeatures: ['Hostel Applications', 'Room Allocation', 'Facility Management'],
              url: '/hostel' 
            },
            { 
              id: 'communication', 
              title: 'Communication Hub', 
              desc: 'Centralized platform for notices, announcements, and campus-wide communications.',
              subFeatures: ['Notices', 'Announcements', 'Notifications'],
              url: '/notices' 
            },
            { 
              id: 'admin', 
              title: 'Administration', 
              desc: 'Powerful admin tools including super admin controls, sub-admin management, and global settings.',
              subFeatures: ['Super Admin', 'Sub-Admins', 'Staff Management', 'Settings'],
              url: '/admin' 
            },
          ]

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map(feature => (
                <div key={feature.id} className="bg-white rounded-xl border-2 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[320px] hover:scale-105 hover:border-opacity-80" style={{ borderColor: 'var(--primary)' }}>
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="inline-block bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md">{feature.title.split(' ')[0]}</span>
                      <CircleCheckBig className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--primary)' }}>{feature.title}</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4">{feature.desc}</p>
                    
                    {feature.subFeatures && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {feature.subFeatures.map((sub, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <Link href={feature.url} className="inline-flex items-center text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors">
                      Explore →
                    </Link>
                  </div>
                </div>  
              ))}
            </div>
          )
        })()}
      </div>
    </section>

    {/* services Section */}
    <section id="services" className='py-20 bg-gradient-to-b from-gray-50 to-white'>
      <div className='container mx-auto px-6 md:px-12 lg:px-20'>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Our <span style={{ color: 'var(--primary)' }}>Services</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            Comprehensive solutions designed to streamline your institution's operations
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Image Section */}
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                className='w-full h-[500px] object-cover'
                src="/image3.jpg"
                width={1200}
                height={800}
                alt="services"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          </div>

          {/* Right: Services Paragraph */}
          <div className="w-full lg:w-1/2">
            <div className="rounded-2xl p-8 shadow-xl bg-gray-50">
              <p className="text-gray-800 text-lg leading-relaxed">
                {paragraph}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

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