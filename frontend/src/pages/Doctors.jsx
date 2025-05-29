import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'

const Doctors = () => {

  const { speciality } = useParams()

  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate();

  const { doctors } = useContext(AppContext)

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  return (
    <div>
      <p className='text-white'>Browse through the doctors specialist.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button onClick={() => setShowFilter(!showFilter)} className={`py-1 px-3 border rounded text-sm  transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`}>Filters</button>
        <div className={`flex-col gap-4 text-sm text-white ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p onClick={() => speciality === 'Kayachikitsa' ? navigate('/doctors') : navigate('/doctors/Kayachikitsa')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Kayachikitsa' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Kayachikitsa</p>
          <p onClick={() => speciality === 'Shalya Tantra' ? navigate('/doctors') : navigate('/doctors/Shalya Tantra')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Shalya Tantra' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Shalya Tantra</p>
          <p onClick={() => speciality === 'Shalakya Tantra' ? navigate('/doctors') : navigate('/doctors/Shalakya Tantra')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Shalakya Tantra' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Shalakya Tantra</p>
          <p onClick={() => speciality === 'Kaumarbhritya' ? navigate('/doctors') : navigate('/doctors/Kaumarbhritya')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Kaumarbhritya' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Kaumarbhritya</p>
          <p onClick={() => speciality === 'Vajikarana' ? navigate('/doctors') : navigate('/doctors/Vajikarana')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Vajikarana' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Vajikarana</p>
          <p onClick={() => speciality === 'Panchakarma' ? navigate('/doctors') : navigate('/doctors/Panchakarma')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Panchakarma' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Panchakarma</p>
        </div>

        <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pt-5 px-3 sm:px-0'>
          {filterDoc.map((item, index) => (
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
      </div>
    </div>
  )
}

export default Doctors