import React from 'react'
import { specialityData } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'

const SpecialityMenu = () => {
  const navigate = useNavigate();

  return (
    <div id='speciality' className='flex flex-col items-center gap-4 py-16 text-[#262626]'>
      {/* Why Choose Ayurveda Section */}
      <div className='w-full flex justify-center py-10 px-0 sm:px-4 text-center'>
        <div className='flex flex-col items-center max-w-6xl w-full'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-white font-aboreto mb-5 sm:mb-10'>Holistic Care at Your Fingertips</h2>
          <div className='flex flex-col sm:flex-row justify-center gap-5 w-full max-w-5xl px-4'>
            {/* Grid 1 - Find Remedies */}
            <div className='flex-1 p-6 sm:p-8 text-center min-h-[200px] hover:-translate-y-2.5 transition-transform duration-300 relative'>
              <div className='absolute right-0 top-0 bottom-0 w-0 sm:w-[1px] bg-gradient-to-b from-transparent via-white to-transparent'></div>
              <h3 className='text-xl sm:text-2xl font-bold text-[#668400] mb-2.5'>Personalized Health Guidance</h3>
              <p className='text-sm text-white/75 mb-5'>
                Our AI chatbot provides customized suggestions based on Ayurvedic principles.
              </p>
              <button 
                className='bg-[#E78D00] text-white px-5 py-2.5 rounded-3xl font-bold hover:bg-[#ffb640] transition-colors duration-300'
                onClick={() => {navigate("/about"); scrollTo(0, 0)}}
              >
                Find Remedies
              </button>
            </div>

            {/* Grid 2 - Find Doctor */}
            <div className='flex-1 p-6 sm:p-8 text-center min-h-[200px] hover:-translate-y-2.5 transition-transform duration-300 relative'>
              <div className='absolute right-0 top-0 bottom-0 w-0 sm:w-[1px] bg-gradient-to-b from-transparent via-white to-transparent'></div>
              <h3 className='text-xl sm:text-2xl font-bold text-[#668400] mb-2.5'>Convenient Doctor Search</h3>
              <p className='text-sm text-white/75 mb-5'>
                Easily connect with Ayurvedic doctors near you for expert consultations.
              </p>
              <button 
                className='bg-[#E78D00] text-white px-5 py-2.5 rounded-3xl font-bold hover:bg-[#ffb640] transition-colors duration-300'
                onClick={() => {navigate("/doctors"); scrollTo(0, 0)}}
              >
                Find Doctor
              </button>
            </div>

            {/* Grid 3 - Blogs */}
            <div className='flex-1 p-6 sm:p-8 text-center min-h-[200px] hover:-translate-y-2.5 transition-transform duration-300'>
              <h3 className='text-xl sm:text-2xl font-bold text-[#668400] mb-2.5'>Authentic Ayurvedic Knowledge</h3>
              <p className='text-sm text-white/75 mb-5'>
                Gain insights into traditional healing methods through our blog section.
              </p>
              <button 
                className='bg-[#E78D00] text-white px-5 py-2.5 rounded-3xl font-bold hover:bg-[#ffb640] transition-colors duration-300'
                onClick={() => {navigate("/contact"); scrollTo(0, 0)}}
              >
                Read Blogs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpecialityMenu