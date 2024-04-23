import React from 'react'
import { Link } from 'react-router-dom';
import '../App.css';


export default function ScrollToSomeSection({ section }) {
    const scrollToAboutSection = () => {
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    };
    return (
        <Link aria-current="page" to="/" className="btn-scroll scrollto" onClick={scrollToAboutSection}><i className="bi bi-chevron-double-down"></i></Link>
    )
}
