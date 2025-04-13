import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Header = () => {
    const navigate = useNavigate()
    return (
        <div className='flex flex-col md:flex-row flex-wrap bg-none rounded-lg px-3 md:px-6 lg:px-10 '>

            {/* --------- Header Left --------- */}
            <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]'>
                <p className='text-6xl md:text-7xl lg:text-8xl text-white font-aboreto font-semibold leading-tight md:leading-tight lg:leading-tight'>
                    AYURVEDA 
                </p>
                <p className='text-1xl md:text-2xl lg:text-3xl text-[#668400] font-semibold leading-tight md:leading-tight lg:leading-tight'>
                Healing Through Nature, Rooted in Tradition.
                </p>
                <div className='flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light'>
                    <img className='w-28' src={assets.group_profiles} alt="" />
                    <p>Experience the timeless wisdom of Ayurveda, 
                        a holistic approach to wellness that nurtures the body, mind, and spirit. 
                        Our platform blends ancient healing practices with modern insights to promote balance, vitality, and natural well-being.</p>
                </div>
                <button onClick={() => { navigate('/about'); scrollTo(0, 0) }} className='flex items-center gap-2 bg-[#E78D00] px-8 py-3 rounded-full text-white text-bold m-auto md:m-0 hover:scale-105 transition-all duration-300'>Get Personalized Remedies</button>
            </div>

            {/* --------- Header Right --------- */}
            <div className='md:w-1/2 relative'>
                <img className='w-full md:absolute bottom-0 h-auto rounded-lg' src={assets.header_img} alt="" />
            </div>
        </div>
    )
}

export default Header