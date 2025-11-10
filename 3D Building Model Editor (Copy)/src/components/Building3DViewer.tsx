import React, { useRef, useImperativeHandle, forwardRef, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingConfig } from '../App';

interface Building3DViewerProps {
  config: BuildingConfig;
  cameraPreset: string;
}

function EllipticalSkyscraper({ config }: { config: BuildingConfig }) {
  const groupRef = useRef<THREE.Group>(null);

  const createEllipticalShape = useCallback((majorAxis: number, minorAxis: number, segments: number = 64) => {
    const shape = new THREE.Shape();
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = (majorAxis / 2) * Math.cos(angle);
      const y = (minorAxis / 2) * Math.sin(angle);
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    
    return shape;
  }, []);

  const getEllipticalPoint = useCallback((majorAxis: number, minorAxis: number, angle: number, rotation: number = 0) => {
    const x = (majorAxis / 2) * Math.cos(angle);
    const z = (minorAxis / 2) * Math.sin(angle);
    
    // Apply floor rotation around z-axis
    const cosRot = Math.cos(rotation);
    const sinRot = Math.sin(rotation);
    
    return {
      x: x * cosRot - z * sinRot,
      z: x * sinRot + z * cosRot
    };
  }, []);

  const createContinuousGlazing = useCallback(() => {
    const group = new THREE.Group();
    const segments = 64;
    const { majorAxis, minorAxis, height, floors, rotationPerFloor } = config;
    const floorHeight = height / floors;

    const glassMaterial = new THREE.MeshLambertMaterial({ 
      color: config.glassColor,
      transparent: true,
      opacity: config.glassOpacity,
      side: THREE.DoubleSide
    });

    // Create seamless glazing panels between each pair of consecutive floors
    for (let floor = 0; floor < floors; floor++) {
      const bottomY = floor * floorHeight + 0.2; // Slightly above floor plate
      const topY = (floor + 1) * floorHeight; // At the top of next floor plate
      
      const bottomRotation = (floor * rotationPerFloor * Math.PI) / 180;
      const topRotation = ((floor + 1) * rotationPerFloor * Math.PI) / 180;

      // Create glazing segments around the perimeter following exact floor plate profiles
      for (let i = 0; i < segments; i++) {
        const currentAngle = (i / segments) * Math.PI * 2;
        const nextAngle = ((i + 1) / segments) * Math.PI * 2;
        
        // Calculate exact points on the elliptical perimeter for bottom floor
        const bottomRadius1X = (majorAxis / 2) * Math.cos(currentAngle);
        const bottomRadius1Z = (minorAxis / 2) * Math.sin(currentAngle);
        const bottomRadius2X = (majorAxis / 2) * Math.cos(nextAngle);
        const bottomRadius2Z = (minorAxis / 2) * Math.sin(nextAngle);
        
        // Apply bottom floor rotation
        const bottomCos = Math.cos(bottomRotation);
        const bottomSin = Math.sin(bottomRotation);
        const bottomPoint1 = {
          x: bottomRadius1X * bottomCos - bottomRadius1Z * bottomSin,
          z: bottomRadius1X * bottomSin + bottomRadius1Z * bottomCos
        };
        const bottomPoint2 = {
          x: bottomRadius2X * bottomCos - bottomRadius2Z * bottomSin,
          z: bottomRadius2X * bottomSin + bottomRadius2Z * bottomCos
        };
        
        // Calculate exact points on the elliptical perimeter for top floor
        const topRadius1X = (majorAxis / 2) * Math.cos(currentAngle);
        const topRadius1Z = (minorAxis / 2) * Math.sin(currentAngle);
        const topRadius2X = (majorAxis / 2) * Math.cos(nextAngle);
        const topRadius2Z = (minorAxis / 2) * Math.sin(nextAngle);
        
        // Apply top floor rotation
        const topCos = Math.cos(topRotation);
        const topSin = Math.sin(topRotation);
        const topPoint1 = {
          x: topRadius1X * topCos - topRadius1Z * topSin,
          z: topRadius1X * topSin + topRadius1Z * topCos
        };
        const topPoint2 = {
          x: topRadius2X * topCos - topRadius2Z * topSin,
          z: topRadius2X * topSin + topRadius2Z * topCos
        };
        
        // Create vertices for the glazing panel that exactly follows the floor plate profiles
        const vertices = [
          // Bottom edge of panel (following bottom floor profile)
          bottomPoint1.x, bottomY, bottomPoint1.z,
          bottomPoint2.x, bottomY, bottomPoint2.z,
          // Top edge of panel (following top floor profile)
          topPoint2.x, topY, topPoint2.z,
          topPoint1.x, topY, topPoint1.z
        ];
        
        // Create faces forming a twisted quad
        const indices = [
          0, 1, 2,  // First triangle
          0, 2, 3   // Second triangle
        ];
        
        // UV mapping
        const uvs = [
          i / segments, 0,           // Bottom point 1
          (i + 1) / segments, 0,     // Bottom point 2  
          (i + 1) / segments, 1,     // Top point 2
          i / segments, 1            // Top point 1
        ];
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        const glassPanel = new THREE.Mesh(geometry, glassMaterial);
        group.add(glassPanel);
      }
    }
    
    return group;
  }, [config]);

  const createVerticalLouvers = useCallback(() => {
    if (!config.enableLouvers) return new THREE.Group();
    
    const group = new THREE.Group();
    const louverGeometry = new THREE.BoxGeometry(0.15, config.height, config.louverDepth);
    const louverMaterial = new THREE.MeshLambertMaterial({ color: config.louverColor });
    
    const segments = 64;
    const offsetRadius = Math.max(config.majorAxis, config.minorAxis) / 2 + config.louverDepth / 2 + 0.5;
    
    for (let i = 0; i < segments; i += Math.floor(config.louverSpacing)) {
      const angle = (i / segments) * Math.PI * 2;
      
      // Position louvers slightly outside the building envelope
      const x = offsetRadius * Math.cos(angle);
      const z = offsetRadius * Math.sin(angle);
      
      const louver = new THREE.Mesh(louverGeometry, louverMaterial);
      louver.position.set(x, config.height / 2, z);
      louver.rotation.y = angle + Math.PI / 2; // Perpendicular to radius
      
      group.add(louver);
    }
    
    return group;
  }, [config.enableLouvers, config.height, config.louverDepth, config.louverColor, config.louverSpacing, config.majorAxis, config.minorAxis]);

  const createBuilding = useCallback(() => {
    if (!groupRef.current) return;

    // Clear existing building
    groupRef.current.clear();

    const { majorAxis, minorAxis, height, floors, rotationPerFloor, facadeColor } = config;
    const floorHeight = height / floors;

    // Create elliptical shape
    const ellipticalShape = createEllipticalShape(majorAxis, minorAxis);

    // Create each floor plate
    for (let floor = 0; floor < floors; floor++) {
      const y = floor * floorHeight;
      const rotation = (floor * rotationPerFloor * Math.PI) / 180; // Rotation around z-axis (x-y plane)

      // Floor plate (structure)
      const extrudeSettings = {
        depth: 0.4,
        bevelEnabled: false
      };
      
      const floorGeometry = new THREE.ExtrudeGeometry(ellipticalShape, extrudeSettings);
      const floorMaterial = new THREE.MeshLambertMaterial({ color: facadeColor });
      const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
      
      floorMesh.position.y = y;
      floorMesh.rotation.z = rotation; // Rotate around z-axis for x-y plane rotation
      floorMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
      
      groupRef.current.add(floorMesh);
    }

    // Add continuous glazing between floors
    const glazing = createContinuousGlazing();
    groupRef.current.add(glazing);

    // Add vertical louvers
    const louvers = createVerticalLouvers();
    groupRef.current.add(louvers);

    // Add crown/top floor with slight taper
    const crownShape = createEllipticalShape(majorAxis * 0.95, minorAxis * 0.95);
    const crownGeometry = new THREE.ExtrudeGeometry(crownShape, {
      depth: 3,
      bevelEnabled: true,
      bevelThickness: 0.8,
      bevelSize: 0.3
    });
    const crownMaterial = new THREE.MeshLambertMaterial({ color: facadeColor });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    
    crown.position.y = height;
    crown.rotation.z = ((floors - 1) * rotationPerFloor * Math.PI) / 180;
    crown.rotation.x = -Math.PI / 2;
    
    groupRef.current.add(crown);

    // Add building core (elevator shaft visualization)
    const coreGeometry = new THREE.CylinderGeometry(
      Math.min(majorAxis, minorAxis) * 0.15, 
      Math.min(majorAxis, minorAxis) * 0.15, 
      height, 
      8
    );
    const coreMaterial = new THREE.MeshLambertMaterial({ 
      color: '#555555',
      transparent: true,
      opacity: 0.4 
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.y = height / 2;
    groupRef.current.add(core);

    // Add base/foundation
    const baseShape = createEllipticalShape(majorAxis * 1.1, minorAxis * 1.1);
    const baseGeometry = new THREE.ExtrudeGeometry(baseShape, {
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.2
    });
    const baseMaterial = new THREE.MeshLambertMaterial({ color: '#777777' });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    
    base.position.y = -1;
    base.rotation.x = -Math.PI / 2;
    
    groupRef.current.add(base);

  }, [config, createEllipticalShape, createContinuousGlazing, createVerticalLouvers]);

  useEffect(() => {
    createBuilding();
  }, [createBuilding]);

  return <group ref={groupRef} />;
}

function CameraController({ preset }: { preset: string }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (!controls) return;

    const orbitControls = controls as any;
    
    switch (preset) {
      case 'front':
        camera.position.set(0, 60, 80);
        orbitControls.target.set(0, 60, 0);
        break;
      case 'back':
        camera.position.set(0, 60, -80);
        orbitControls.target.set(0, 60, 0);
        break;
      case 'left':
        camera.position.set(-80, 60, 0);
        orbitControls.target.set(0, 60, 0);
        break;
      case 'right':
        camera.position.set(80, 60, 0);
        orbitControls.target.set(0, 60, 0);
        break;
      case 'top':
        camera.position.set(0, 200, 0);
        orbitControls.target.set(0, 0, 0);
        break;
      case 'isometric':
        camera.position.set(60, 80, 60);
        orbitControls.target.set(0, 60, 0);
        break;
      case 'ground':
        camera.position.set(40, 5, 40);
        orbitControls.target.set(0, 20, 0);
        break;
      case 'aerial':
        camera.position.set(100, 150, 100);
        orbitControls.target.set(0, 60, 0);
        break;
      default: // perspective
        camera.position.set(50, 80, 50);
        orbitControls.target.set(0, 60, 0);
    }
    
    orbitControls.update();
  }, [preset, camera, controls]);

  return null;
}

const Building3DViewer = forwardRef<any, Building3DViewerProps>(({ config, cameraPreset }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    takeScreenshot: async () => {
      if (!canvasRef.current) throw new Error('Canvas not available');
      
      return new Promise<string>((resolve) => {
        // Ensure the canvas is rendered before taking screenshot
        setTimeout(() => {
          if (canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL('image/png');
            resolve(dataUrl);
          }
        }, 100);
      });
    },
    
    getCameraState: () => {
      // This would need to be implemented to get actual camera state
      return {
        position: [50, 80, 50] as [number, number, number],
        target: [0, 60, 0] as [number, number, number]
      };
    },
    
    setCameraPreset: (preset: string) => {
      // Camera preset is handled by the CameraController component
    },
    
    exportModel: () => {
      // Implement model export functionality
      console.log('Exporting elliptical skyscraper model...');
    }
  }));

  return (
    <div className="w-full h-full">
      <Canvas
        ref={canvasRef}
        camera={{ position: [50, 80, 50], fov: 50 }}
        shadows
      >
        <Environment preset="city" />
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[50, 100, 30]} 
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={200}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
        />
        
        {/* Additional lighting for glass reflections */}
        <pointLight position={[-30, 50, 30]} intensity={0.5} color="#ffffff" />
        <pointLight position={[30, 50, -30]} intensity={0.5} color="#ffffff" />
        
        <EllipticalSkyscraper config={config} />
        <Grid 
          args={[200, 200]} 
          position={[0, 0, 0]}
          cellSize={5}
          cellThickness={0.5}
          cellColor="#6e6e6e"
          sectionSize={25}
          sectionThickness={1}
          sectionColor="#3e3e3e"
          fadeDistance={100}
          fadeStrength={1}
        />
        
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={20}
          maxDistance={300}
          maxPolarAngle={Math.PI / 1.8}
        />
        
        <CameraController preset={cameraPreset} />
      </Canvas>
    </div>
  );
});

Building3DViewer.displayName = 'Building3DViewer';

export { Building3DViewer };