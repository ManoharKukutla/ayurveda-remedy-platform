import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { blogData } from '../utils/blogs'

const TopBlogs = () => {
  const navigate = useNavigate()

  return (
    <div className='flex flex-col items-center my-16 text-[#262626] md:mx-10'>
      <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-white font-aboreto mb-0 sm:mb-5'>Top Ayurvedic Blogs</h1>
      <p className='text-sm text-white/75 mb-12'>Explore curated Ayurvedic insights and lifestyle tips.</p>

      <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-5 px-3 sm:px-0'>
        {blogData.slice(0, 4).map((blog) => (
          <div 
            key={blog.id} 
            className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-2 cursor-pointer"
            onClick={() => {
              navigate(`/blogs/${blog.id}`)
              scrollTo(0, 0)
            }}
          >
            <img 
              src={blog.image} 
              alt={blog.title} 
              className="w-full h-44 object-cover"
            />
            <div className="p-4 text-white">
              <h2 className="text-lg font-semibold mb-2">{blog.title}</h2>
              <p className="text-sm text-white/80 mb-3 line-clamp-3">{blog.summary}</p>
              <span className="text-primary font-medium hover:underline">
                Read More →
              </span>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => { navigate('/contact'); scrollTo(0, 0) }} 
        className='bg-[#EAEFFF] text-gray-600 px-12 py-3 rounded-full mt-10'
      >
        See All Blogs
      </button>
    </div>
  )
}

export default TopBlogs
