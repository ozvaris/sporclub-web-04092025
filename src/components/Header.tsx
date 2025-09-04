// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import Image from "next/image";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  return (
    <nav id="header" className="w-full z-30 top-0 py-1 bg-white shadow">
      <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 px-6 py-3">

        {/* hamburger (md:hidden) */}
        <button
          aria-label="Toggle menu"
          className="cursor-pointer md:hidden block"
          onClick={() => setOpen(!open)}
        >
          <svg
            className="fill-current text-gray-900"
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <title>menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>

        {/* brand */}
        <div className="order-1 md:order-2">
          <Link
            href="/"
            className="flex items-center tracking-wide no-underline hover:no-underline font-bold text-gray-800 text-xl"
          >
            <Image
              src="http://localhost:3000/media/dev-images/logo1.png"           // public/icons/soccer-player.png
              alt="Ayağında top tutan futbolcu ikon"
              width={24}
              height={24}
              priority
            />
            Talenty
          </Link>
        </div>

        {/* main nav */}
        <div
          id="menu"
          className={`${open ? 'block' : 'hidden'} md:flex md:items-center md:w-auto w-full order-3 md:order-1`}
        >
          <ul className="md:flex items-center justify-between text-base text-gray-700 pt-4 md:pt-0">
            <li>
              <Link
                href="/"
                className="inline-block no-underline hover:text-black hover:underline py-2 px-4"
              >
                Al-Sat
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="inline-block no-underline hover:text-black hover:underline py-2 px-4"
              >
                Klüpler
              </Link>
            </li>
            <li>
              <Link
                href="#about"
                className="inline-block no-underline hover:text-black hover:underline py-2 px-4"
              >
                Oyuncular
              </Link>
            </li>

            {/* Auth alanı: loading → skeleton; değilse user durumuna göre menü */}
            {loading ? (
              <li className="py-2 px-4">
                <div className="h-6 w-24 rounded bg-gray-200 animate-pulse" />
              </li>
            ) : user ? (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className="inline-block no-underline hover:text-black hover:underline py-2 px-4"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="inline-block no-underline hover:text-red-600 py-2 px-4"
                  >
                    Çıkış
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/login"
                  className="inline-block no-underline hover:text-black hover:underline py-2 px-4"
                >
                  Giriş
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* right-side icons */}
        <div className="order-2 md:order-3 flex items-center text-gray-900" id="nav-content">
          <Link href="/profile" className="inline-block no-underline hover:text-black">
            {/* user icon */}
            <svg
              className="w-6 h-6 fill-current text-gray-900 hover:text-primary"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <circle fill="none" cx="12" cy="7" r="3" />
              <path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5S14.757 2 12 2zM12 10c-1.654 0-3-1.346-3-3s1.346-3 3-3 3,1.346 3,3S13.654 10 12 10zM21 21v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h2v-1c0-2.757 2.243-5 5-5h4c2.757 0 5 2.243 5 5v1H21z" />
            </svg>
          </Link>

          <Link href="/cart" className="pl-3 inline-block no-underline hover:text-black">
            {/* cart icon */}
            <svg
              className="w-6 h-6 fill-current text-gray-900 hover:text-primary"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <path d="M21,7H7.462L5.91,3.586C5.748,3.229,5.392,3,5,3H2v2h2.356L9.09,15.414C9.252,15.771,9.608,16,10,16h8 c0.4,0,0.762-0.238,0.919-0.606l3-7c0.133-0.309,0.101-0.663-0.084-0.944C21.649,7.169,21.336,7,21,7z M17.341,14h-6.697L8.371,9 h11.112L17.341,14z" />
              <circle cx="10.5" cy="18.5" r="1.5" />
              <circle cx="17.5" cy="18.5" r="1.5" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
