/**
 * Resizable Frames - Allows users to resize frame sections by dragging a divider
 * Compatible with serverless architecture as it's entirely client-side
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const container = document.getElementById('resizableFrames');
  const divider = document.getElementById('resizeDivider');
  const leftSection = document.getElementById('evidenceSection');
  const rightSection = document.getElementById('instrumentSection');
  
  // Skip if elements don't exist
  if (!container || !divider || !leftSection || !rightSection) return;
  
  // Variables to track resize state
  let isResizing = false;
  let startX, startY;
  let startLeftWidth, startRightWidth;
  let startLeftHeight, startRightHeight;
  
  // Store initial sizes to allow for reset
  const initialSizes = {
    leftWidth: leftSection.offsetWidth,
    rightWidth: rightSection.offsetWidth,
    leftHeight: leftSection.offsetHeight,
    rightHeight: rightSection.offsetHeight
  };
  
  // Save sizes to localStorage
  function saveSizes() {
    try {
      const sizes = {
        leftWidth: leftSection.style.width || null,
        rightWidth: rightSection.style.width || null,
        leftHeight: leftSection.style.height || null,
        rightHeight: rightSection.style.height || null,
        timestamp: Date.now()
      };
      localStorage.setItem('accreditorFrameSizes', JSON.stringify(sizes));
    } catch (e) {
      console.log('Could not save frame sizes to localStorage');
    }
  }
  
  // Load sizes from localStorage
  function loadSizes() {
    try {
      const savedSizes = localStorage.getItem('accreditorFrameSizes');
      if (savedSizes) {
        const sizes = JSON.parse(savedSizes);
        // Only use saved sizes if they're less than a week old
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - sizes.timestamp < oneWeek) {
          if (sizes.leftWidth) leftSection.style.width = sizes.leftWidth;
          if (sizes.rightWidth) rightSection.style.width = sizes.rightWidth;
          if (sizes.leftHeight) leftSection.style.height = sizes.leftHeight;
          if (sizes.rightHeight) rightSection.style.height = sizes.rightHeight;
          return true;
        }
      }
    } catch (e) {
      console.log('Could not load saved frame sizes');
    }
    return false;
  }
  
  // Set initial sizes (50/50 split if no saved sizes)
  function setInitialSizes() {
    const loaded = loadSizes();
    if (!loaded) {
      // Default to 50/50 split
      const isHorizontal = window.innerWidth > 992;
      if (isHorizontal) {
        const containerWidth = container.offsetWidth;
        const width = `${(containerWidth / 2) - 4}px`;
        leftSection.style.width = width;
        rightSection.style.width = width;
      } else {
        const containerHeight = container.offsetHeight;
        const height = `${(containerHeight / 2) - 4}px`;
        leftSection.style.height = height;
        rightSection.style.height = height;
      }
    }
  }
  
  // Start resizing
  function startResize(e) {
    isResizing = true;
    startX = e.clientX || e.touches[0].clientX;
    startY = e.clientY || e.touches[0].clientY;
    
    // Get current widths/heights
    startLeftWidth = leftSection.offsetWidth;
    startRightWidth = rightSection.offsetWidth;
    startLeftHeight = leftSection.offsetHeight;
    startRightHeight = rightSection.offsetHeight;
    
    // Add active class and event listeners
    divider.classList.add('active');
    document.addEventListener('mousemove', resize);
    document.addEventListener('touchmove', resize);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('touchend', stopResize);
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
  }
  
  // Handle resize
  function resize(e) {
    if (!isResizing) return;
    
    // Get current position
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || startX;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || startY;
    
    // Calculate movement
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    
    // Check if we're in horizontal or vertical mode
    const isHorizontal = window.innerWidth > 992;
    
    if (isHorizontal) {
      // Calculate new widths
      let newLeftWidth = startLeftWidth + deltaX;
      let newRightWidth = startRightWidth - deltaX;
      
      // Enforce minimum width
      const minWidth = 200;
      if (newLeftWidth < minWidth) {
        newLeftWidth = minWidth;
        newRightWidth = container.offsetWidth - minWidth - divider.offsetWidth;
      } else if (newRightWidth < minWidth) {
        newRightWidth = minWidth;
        newLeftWidth = container.offsetWidth - minWidth - divider.offsetWidth;
      }
      
      // Apply new widths
      leftSection.style.width = `${newLeftWidth}px`;
      leftSection.style.flex = 'none';
      rightSection.style.width = `${newRightWidth}px`;
      rightSection.style.flex = 'none';
    } else {
      // Calculate new heights
      let newLeftHeight = startLeftHeight + deltaY;
      let newRightHeight = startRightHeight - deltaY;
      
      // Enforce minimum height
      const minHeight = 200;
      if (newLeftHeight < minHeight) {
        newLeftHeight = minHeight;
        newRightHeight = container.offsetHeight - minHeight - divider.offsetHeight;
      } else if (newRightHeight < minHeight) {
        newRightHeight = minHeight;
        newLeftHeight = container.offsetHeight - minHeight - divider.offsetHeight;
      }
      
      // Apply new heights
      leftSection.style.height = `${newLeftHeight}px`;
      leftSection.style.flex = 'none';
      rightSection.style.height = `${newRightHeight}px`;
      rightSection.style.flex = 'none';
    }
    
    // Prevent event bubbling
    e.preventDefault();
  }
  
  // Stop resizing
  function stopResize() {
    if (!isResizing) return;
    
    isResizing = false;
    divider.classList.remove('active');
    
    // Remove event listeners
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('touchmove', resize);
    document.removeEventListener('mouseup', stopResize);
    document.removeEventListener('touchend', stopResize);
    
    // Re-enable text selection
    document.body.style.userSelect = '';
    
    // Save the new sizes
    saveSizes();
  }
  
  // Reset to default sizes (50/50)
  function resetSizes() {
    const isHorizontal = window.innerWidth > 992;
    if (isHorizontal) {
      const containerWidth = container.offsetWidth;
      const width = `${(containerWidth / 2) - 4}px`;
      leftSection.style.width = width;
      rightSection.style.width = width;
    } else {
      const containerHeight = container.offsetHeight;
      const height = `${(containerHeight / 2) - 4}px`;
      leftSection.style.height = height;
      rightSection.style.height = height;
    }
    saveSizes();
  }
  
  // Double-click on divider to reset
  divider.addEventListener('dblclick', resetSizes);
  
  // Add event listeners for mouse and touch
  divider.addEventListener('mousedown', startResize);
  divider.addEventListener('touchstart', startResize);
  
  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      // Reset flex property when switching between horizontal and vertical layouts
      const isHorizontal = window.innerWidth > 992;
      if (isHorizontal) {
        if (leftSection.style.height) {
          // Coming from vertical to horizontal
          leftSection.style.height = '';
          rightSection.style.height = '';
          resetSizes();
        }
      } else {
        if (leftSection.style.width) {
          // Coming from horizontal to vertical
          leftSection.style.width = '';
          rightSection.style.width = '';
          resetSizes();
        }
      }
    }, 250);
  });
  
  // Set initial sizes
  setInitialSizes();
});
