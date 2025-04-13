import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
const TopDoctors = () => {

    const navigate = useNavigate()

    const { doctors } = useContext(AppContext)

    return (
        <div className='flex flex-col items-center my-16 text-[#262626] md:mx-10'>
            <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-white font-aboreto mb-0 sm:mb-5'>Top Doctors to Book</h1>
            <p className='text-sm text-white/75 mb-12'>Simply browse through our extensive list of trusted doctors.</p>
            {/* <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
                {doctors.slice(0, 10).map((item, index) => (
                    <div onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }} className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                        <img className='bg-[#EAEFFF]' src={item.image} alt="" />
                        <div className='p-4'>
                            <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : "text-gray-500"}`}>
                                <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : "bg-gray-500"}`}></p><p>{item.available ? 'Available' : "Not Available"}</p>
                            </div>
                            <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
                            <p className='text-[#5C5C5C] text-sm'>{item.speciality}</p>
                        </div>
                    </div>
                ))}
            </div> */}



<div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pt-5 px-3 sm:px-0'>
  {doctors.slice(0, 10).map((item, index) => (
    <div 
      key={index}
      className="w-full h-80 relative"
      onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }}
    >
      {/* Main card container */}
          <div className="w-full h-60 left-0 top-[46px] absolute bg-white/5 rounded-3xl outline outline-1 outline-offset-[-1px] outline-white/40 overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}">
              {/* Content container */}
              <div className="w-full p-4 top-[99px] absolute flex flex-col items-center bg-transparent">
                  {/* Availability indicator - kept from original */}
                  <div className={`flex items-center gap-2 text-sm bg-transparent ${item.available ? 'text-green-500' : "text-gray-500"}`}>
                      <div className={`w-2 h-2 rounded-full  ${item.available ? 'bg-green-500' : "bg-gray-500"}`}></div>
                      <p className='bg-transparent'>{item.available ? 'Available' : "Not Available"}</p>
                  </div>

                  {/* Doctor info - original text styling */}
                  <p className='text-3xl text-[#ffffff] text-lg font-medium mt-2 bg-transparent'>{item.name}</p>
                  <p className='text-primary text-sm mb-4 bg-transparent'>{item.speciality}</p>

              </div>
          </div>

          {/* Doctor image container - new circular style */}
          <div className="w-32 h-32 left-1/2 -translate-x-1/2 top-0 absolute bg-[#EAEFFF] rounded-full overflow-hidden">
              <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover bg-white"
              />
          </div>
      </div>
  ))}
        </div>
            <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className='bg-[#EAEFFF] text-gray-600 px-12 py-3 rounded-full mt-10'>more</button>
        </div>

    )
}

export default TopDoctors