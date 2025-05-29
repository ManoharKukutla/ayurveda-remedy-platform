import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10 bg-[rgba(97,120,19,0.4)]'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 mx-10 py-10 mt-40 text-sm'>

        <div>
          <img className='mb-5 w-40' src={assets.logo} alt="" />
          <p className='w-full md:w-2/3 text-[rgba(255,255,255,0.8)] leading-6'>Your trusted Ayurveda companion — discover natural remedies, connect with certified Ayurvedic doctors, chat with our AI-powered AyurBot, and explore wellness blogs for a healthier lifestyle.</p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5 text-white'>Company</p>
          <ul className='flex flex-col gap-2 text-[rgba(255,255,255,0.8)]'>
            <li>Home</li>
            <li>AyurBot</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5 text-white'>Get in touch</p>
          <ul className='flex flex-col gap-2 text-[rgba(255,255,255,0.8)]'>
            <li>+1-11-222-3333</li>
            <li>Ayurveda@gmail.com</li>
          </ul>
        </div>

      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center text-white text-primary'>Copyright 2024 @ Ayurveda.com - All Right Reserved.</p>
      </div>

    </div>
  )
}

export default Footer
