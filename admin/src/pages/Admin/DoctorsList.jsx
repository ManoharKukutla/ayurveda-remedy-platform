import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

  const { doctors, changeAvailability , aToken , getAllDoctors} = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
        getAllDoctors()
    }
}, [aToken])

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium text-white'>All Doctors</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {doctors.map((item, index) => (
          <div className='border-none rounded-xl max-w-56 overflow-hidden cursor-pointer group' key={index}>
            <img className='bg-[rgba(255,255,255,0.2)] group-hover:bg-primary transition-all duration-300' src={item.image} alt="" />
            <div className='p-4 bg-white'>
              <p className='text-black text-lg font-medium'>{item.name}</p>
              <p className='text-primary text-sm'>{item.speciality}</p>
              <div className='mt-2 flex items-center gap-1 text-sm'>
                <input onChange={()=>changeAvailability(item._id)} type="checkbox" checked={item.available} />
                <p className='text-[#008000]'>Available</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsList