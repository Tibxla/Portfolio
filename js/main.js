/**
 * Main Application Entry Point
 * Orchestrates the initialization of Background, Physics, and UI modules
 */

import { initBackground } from './backgrounds.js';
import { initPhysics, initVolumetricCard } from './physics.js';
import { initUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize independent modules
    initBackground();
    initPhysics();
    initVolumetricCard();
    initUI();
    
    console.log('[App] Modules initialized successfully');
});
