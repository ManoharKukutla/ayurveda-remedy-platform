import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import TopBlogs from '../components/TopBlogs'

const Home = () => {
  return (
    <div>
      <Header />
      <Banner />
      <SpecialityMenu />
      <TopDoctors />
      <TopBlogs />
    </div>
  )
}

export default Home