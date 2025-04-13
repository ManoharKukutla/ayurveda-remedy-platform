import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {

    const navigate = useNavigate()

    return (
        <div className='flex bg-white rounded-lg px-0 py-0 my-20 md:mx-10'>

            {/* ------- Left Side ------- */}
            <div className='hidden md:flex md:w-1/2 lg:w-1/2 relative bg-white items-center justify-center'>
                <img
                    className='w-full h-auto max-h-[500px] object-contain bg-white'
                    src={assets.about_img}
                    alt="About Ayurveda"
                />
            </div>

            {/* ------- Right Side ------- */}
            <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5 bg-white'>
                <div className='bg-transparent'>
                    <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-[#121212] bg-transparent'>About Us</h1>
                    <h2 className='text-xl font-semibold mt-8 bg-white text-primary'>Welcome to Ayurveda – Your Personalized Ayurvedic Wellness Guide!</h2>
                    <p className='bg-white text-[#121212] mt-4'>At Ayurveda, we are committed to reviving the ancient wisdom of
                        holistic healing and blending it with modern technology. Our
                        platform provides personalized Ayurvedic solutions to help individuals
                        embrace a natural, balanced, and healthy lifestyle.</p>
                </div>
            </div>
        </div>
    )
}

export default Banner