import React, { useEffect, useRef, useContext } from 'react';
import L from 'leaflet';
import { IssueContext } from '../context/IssueContext';

const IssueMap = ({ onSelectLocation, isReportingMode = false, selectedLocation = null }) => {
  const { issues } = useContext(IssueContext);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const selectedMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center map around Koramangala, Bengaluru
    const map = L.map(mapContainerRef.current).setView([12.9344, 77.6192], 14);
    mapRef.current = map;

    // Dark matter CartoDB tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Click handler for location placement in reporting mode
    if (isReportingMode) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (onSelectLocation) {
          onSelectLocation(lat, lng);
        }
      });
    }

    return () => {
      map.remove();
    };
  }, [isReportingMode]);

  // Sync existing issues to Leaflet markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    issues.forEach(issue => {
      let severityClass = 'low';
      if (issue.severity === 'Critical') severityClass = 'critical';
      else if (issue.severity === 'High') severityClass = 'high';
      else if (issue.severity === 'Medium') severityClass = 'medium';

      const colorVal = getComputedStyle(document.documentElement).getPropertyValue(`--severity-${severityClass}`).trim() || '#10b981';

      // Custom HTML Marker matching our Glassmorphic theme
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: ${colorVal};
          border: 2px solid #fff;
          box-shadow: 0 0 12px ${colorVal};
          cursor: pointer;
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: 'Inter', sans-serif; color: #f3f4f6; width: 220px; line-height: 1.4;">
            <strong style="font-size: 0.95rem; display: block; margin-bottom: 4px; font-family: 'Outfit', sans-serif; color: #fff;">${issue.title}</strong>
            <span style="
              font-size: 0.7rem; 
              font-weight: 700; 
              padding: 2px 8px; 
              border-radius: 9999px; 
              display: inline-block; 
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              background-color: ${colorVal}22;
              color: ${colorVal};
              border: 1px solid ${colorVal}44;
            ">
              ${issue.severity} Severity
            </span>
            <p style="font-size: 0.8rem; color: #9ca3af; margin-bottom: 8px; white-space: normal;">${issue.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px; font-size: 0.75rem;">
              <span style="color: #6b7280;">Status:</span>
              <strong style="color: #10b981;">${issue.status}</strong>
            </div>
          </div>
        `);

      markersRef.current.push(marker);
    });
  }, [issues]);

  // Sync selected location for reporting
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    if (selectedLocation) {
      const { latitude, longitude } = selectedLocation;
      
      const pinColor = '#06b6d4'; // Cyan for selected reporting pin

      const selectedIcon = L.divIcon({
        className: 'selected-div-icon',
        html: `<div style="
          position: relative;
          width: 20px;
          height: 20px;
        ">
          <div style="
            position: absolute;
            width: 20px;
            height: 20px;
            background-color: ${pinColor};
            border-radius: 50%;
            opacity: 0.4;
            animation: ping 1.5s infinite ease-in-out;
          "></div>
          <div style="
            position: absolute;
            top: 4px;
            left: 4px;
            width: 12px;
            height: 12px;
            background-color: ${pinColor};
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 0 10px ${pinColor};
          "></div>
        </div>
        <style>
          @keyframes ping {
            0% { transform: scale(0.5); opacity: 0.8; }
            100% { transform: scale(2.2); opacity: 0; }
          }
        </style>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      selectedMarkerRef.current = L.marker([latitude, longitude], { icon: selectedIcon }).addTo(map);
      map.panTo([latitude, longitude]);
    }
  }, [selectedLocation]);

  return (
    <div className="map-container-wrapper glass">
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%', minHeight: '350px' }}></div>
      {isReportingMode && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 11, 16, 0.9)',
          border: '1px solid var(--card-border)',
          borderRadius: '8px',
          padding: '8px 16px',
          color: 'var(--secondary)',
          fontSize: '0.8rem',
          fontWeight: '600',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          pointerEvents: 'none',
          boxShadow: 'var(--shadow-lg)'
        }}>
          🎯 Click on the map to drop a pin
        </div>
      )}
    </div>
  );
};

export default IssueMap;
