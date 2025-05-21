<!-- src/lib/components/Header.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import DarkLogo from '$lib/components/logo/nopenDarkLogo.png';
    
    let isMenuOpen = false;
    let isTransitioning = false;
    
    // Handle menu toggle with transition lock to prevent multiple clicks during animation
    function toggleMenu() {
        if (!isTransitioning) {
            isTransitioning = true;
            isMenuOpen = !isMenuOpen;
            
            // Reset transition lock after animation completes
            setTimeout(() => {
                isTransitioning = false;
            }, 300);
        }
    }
    
    // Close menu when clicking a link (for mobile)
    function handleNavClick() {
        if (isMenuOpen) {
            toggleMenu();
        }
    }
    
    // Close mobile menu on resize to desktop
    onMount(() => {
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        
        function handleResize(e) {
            if (e.matches && isMenuOpen) {
                isMenuOpen = false;
            }
        }
        
        mediaQuery.addEventListener('change', handleResize);
        
        return () => {
            mediaQuery.removeEventListener('change', handleResize);
        };
    });
    
    // Handle escape key to close menu
    function handleKeydown(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<header class="flex items-center justify-between px-8 py-6 relative z-50 text-white">
    <div class="logo relative z-10">
        <a href="/" on:click={handleNavClick}>
            <img class="cInvert h-12" src={DarkLogo} alt="Norwegian Open WCS 2025 Logo" />
        </a>
    </div>
    
    <!-- Desktop Navigation -->
    <nav class="hidden md:block">
        <ul class="flex space-x-6">
            <li><a href="/register" class="hover:text-amber-200 transition-colors duration-300">Register</a></li>
            <li><a href="/about" class="hover:text-amber-200 transition-colors duration-300">About</a></li>
            <li><a href="/pricing" class="hover:text-amber-200 transition-colors duration-300">Prices</a></li>
            <li><a href="/schedule" class="hover:text-amber-200 transition-colors duration-300">Schedule</a></li>
            <li><a href="/location" class="hover:text-amber-200 transition-colors duration-300">Location</a></li>
            <li><a href="/contact" class="hover:text-amber-200 transition-colors duration-300">Contact</a></li>
        </ul>
    </nav>
    
    <!-- Mobile Menu Button -->
    <div class="md:hidden relative z-10">
        <button 
            on:click={toggleMenu} 
            class="text-white focus:outline-none p-2"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
        >
            <svg class="h-6 w-6 fill-current transition-opacity duration-300 {isMenuOpen ? 'opacity-0 absolute' : 'opacity-100'}" viewBox="0 0 24 24">
                <path
                    fill-rule="evenodd"
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
            </svg>
            <svg class="h-6 w-6 fill-current transition-opacity duration-300 {isMenuOpen ? 'opacity-100' : 'opacity-0 absolute'}" viewBox="0 0 24 24">
                <path
                    fill-rule="evenodd"
                    d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                />
            </svg>
        </button>
    </div>
</header>

<!-- Full-screen Mobile Navigation Menu -->
{#if isMenuOpen}
<div 
    class="fixed inset-0 bg-[#4F4943] z-40 flex md:hidden"
    transition:fade={{ duration: 200 }}
>
    <nav class="h-full w-full flex flex-col justify-center items-center">
        <ul class="flex flex-col items-center justify-between h-3/4 text-white">
            <li transition:fly={{ y: 20, duration: 300, delay: 100 }}>
                <a 
                    href="/register" 
                    on:click={handleNavClick}
                    class="text-3xl font-bold hover:text-amber-200 transition-colors duration-300"
                >
                    Register
                </a>
            </li>
            <li transition:fly={{ y: 20, duration: 300, delay: 100 }}>
                <a 
                    href="/about" 
                    on:click={handleNavClick}
                    class="text-3xl font-bold hover:text-amber-200 transition-colors duration-300"
                >
                    About
                </a>
            </li>
            <li transition:fly={{ y: 20, duration: 300, delay: 100 }}>
                <a 
                    href="/pricing" 
                    on:click={handleNavClick}
                    class="text-3xl font-bold hover:text-amber-200 transition-colors duration-300"
                >
                    Prices
                </a>
            </li>
            <li transition:fly={{ y: 20, duration: 300, delay: 150 }}>
                <a 
                    href="/schedule" 
                    on:click={handleNavClick}
                    class="text-3xl font-bold hover:text-amber-200 transition-colors duration-300"
                >
                    Schedule
                </a>
            </li>
            <li transition:fly={{ y: 20, duration: 300, delay: 200 }}>
                <a 
                    href="/location" 
                    on:click={handleNavClick}
                    class="text-3xl font-bold hover:text-amber-200 transition-colors duration-300"
                >
                    Location
                </a>
            </li>
            <li transition:fly={{ y: 20, duration: 300, delay: 250 }}>
                <a 
                    href="/contact" 
                    on:click={handleNavClick}
                    class="text-3xl font-bold hover:text-amber-200 transition-colors duration-300"
                >
                    Contact
                </a>
            </li>
        </ul>
    </nav>
</div>
{/if}

<style>
    .cInvert {
        filter: invert(100%);
    }
</style>