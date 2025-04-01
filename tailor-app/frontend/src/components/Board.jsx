/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import Image from './Image';
import { getBackendUrl } from '../utils/env.js';
import html2canvas from 'html2canvas-pro';

import ColourPalette from './ColourPalette.jsx';

// images
import activity from '../assets/UI placeholders/activity.jpeg';
import fabric from '../assets/UI placeholders/fabric.jpeg';
import fabric1 from '../assets/UI placeholders/fabric1.jpeg';
import hair from '../assets/UI placeholders/hair.jpeg';
import interior from '../assets/UI placeholders/interior.jpeg';
import palette from '../assets/UI placeholders/palette.jpeg';
import scenery from '../assets/UI placeholders/scenery.jpeg';
import style from '../assets/UI placeholders/style.jpeg';
import runway from '../assets/UI placeholders/runway.jpeg';
import runway2 from '../assets/UI placeholders/runway2.jpeg';
import runway3 from '../assets/UI placeholders/runway3.jpeg';
import runway4 from '../assets/UI placeholders/runway4.jpeg';

// icons
import UndoIcon from '../utils/SVG Icons/UndoIcon'
import ExportIcon from '../utils/SVG Icons/ExportIcon'
import AddIcon from '../utils/SVG Icons/AddIcon'

const BoardTest = (props) => {
    
    // const [images, setImages] = useState([
    //     { id: 1, src: activity, x: 50, y: 50, width: 90, height: 50, selected: false, zIndex: 1 },
    //     { id: 2, src: fabric, x: 50, y: 50, width: 90, height: 50, selected: false, zIndex: 2 },
    //     { id: 3, src: runway2, x: 50, y: 50, width: 90, height: 50, selected: false, zIndex: 3},
    //     { id: 4, src: hair, x: 50, y: 50, width: 90, height: 50, selected: false, zIndex: 4 },
    //     { id: 5, src: style, x: 50, y: 50, width: 90, height: 50, selected: false, zIndex: 5 },
    //     { id: 6, src: palette, x: 50, y: 50, width: 90, height: 50, selected: false, zIndex: 6},
    //     { id: 7, src: runway3, x: 50, y: 50, width: 90, height: 50, selected: false, zIndex: 7 },
    //     { id: 8, src: interior, x: 50, y: 50, width: 90, height: 50, selected: false, zIndex: 8 },
    //     { id: 9, src: runway, x: 50, y: 50, width: 90, height: 50, selected: false, zIndex: 9 },
    //     { id: 10, src: fabric1, x: 50, y: 50, width: 90, height: 50, selected: false, zIndex: 10 },
    //     { id: 11, src: scenery, x: 50, y: 50, width: 90, height: 50, selected: false, zIndex: 11 },
    //     { id: 12, src: runway4, x: 50, y: 50, width: 90, height: 50, selected: false, zIndex: 12 },
    //   ]);
    const API_URL = getBackendUrl();
    const [prompt, setPrompt] = useState(props.prompt)
    const [ids, setIds] = useState(props.ids);
    const [images, setImages] = useState(props.urls);
    const [zIndexMap, setZIndexMap] = useState({}); 
    const [highestZIndex, setHighestZIndex] = useState(0);

    const [selectedId, setSelectedId] = useState(null);
    const boardRef = useRef(null);

    useEffect(() => {
      if (props.ids.length > 0) {
        let maxZ = 0;
        const initialZIndexMap = props.ids.reduce((acc, id, index) => {
          const zIndex = index + 1; // Set z-index in order of appearance
          acc[id] = zIndex
          maxZ = Math.max(maxZ, zIndex);
          return acc;
        }, {});

        console.log(JSON.stringify(initialZIndexMap, null, 2));
        console.log('max Z: '+maxZ);

        setZIndexMap(initialZIndexMap);
        setHighestZIndex(maxZ);
      }
    }, [props.ids]); // Runs when ids change
    

    // Deselect on click
    const handleBoardClick = () => {
      setSelectedId(null);
    };

    // Select on click 
    const handleSelect = (id) => {
      setSelectedId(id);
      console.log("selected ID in board:  " + id)
    };


    const handleDelete = (id) => {

      setIds((prevIds) => {
        const indexToDelete = prevIds.indexOf(id);
        console.log(indexToDelete);
        if (indexToDelete == -1) return prevIds;

        setImages((prevImages) => prevImages.filter((_,idx)=>idx!==indexToDelete));

        return prevIds.filter((currentId) => currentId!==indexToDelete);
      });
      
      setSelectedId(null);
      return;
    }


    const handleAddImage = async () => {
      const response = await fetch(`${API_URL}/api/regenerate-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const [next_image_id, next_image_url] = data.next_image;
      setIds((prevIds) => [...prevIds, next_image_id]); 
      setImages((prevImages) => [...prevImages, next_image_url]); 
    }

    const handleExport = () => {
      html2canvas(boardRef.current).then(async (canvas) => {
        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append('file', blob, 'board.png');
          const userId = '123'; // TODO: temporary, fix later
          formData.append('user_id', userId);
          formData.append('image_ids', ids); 
          formData.append('prompt', prompt);
    
          const uploadPromise = fetch(`${API_URL}/api/boards/upload`, {
            method: 'POST',
            body: formData, 
          });
    
          const imageUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = 'board.png';  
          link.click();
    
          // Wait for upload to complete
          await uploadPromise;
        }, 'board/png');
      });
    };

    const bringToFront = (id) => {
      console.log('bring to front');
      setZIndexMap((prev) => ({
        ...prev,
        [id]: highestZIndex + 1,
      }));
      setHighestZIndex((prev) => prev + 1);
    };

    return (
        <div className="flex flex-col p-1 max-w-5xl">

          <div className="flex flex-row justify-start gap-3 mb-4 mx-5">

            <button className="flex items-center gap-4 px-3 py-1.5 rounded-xl border-gray-600 border-2 hover:bg-gray-300 cursor-pointer"
            onClick={handleExport}> 
            <ExportIcon/>
            Download
            </button>

            <button className="flex items-center gap-3 px-3 py-1.5 rounded-xl border-gray-600 border-2 hover:bg-gray-300 cursor-pointer" 
            onClick={handleAddImage}
            >
            <AddIcon/>
            Add
            </button>

            <button className="flex items-center gap-4 px-3 py-1.5 rounded-xl border-gray-600 border-2 hover:bg-gray-300 cursor-pointer"> 
            <UndoIcon/>
            Undo
            </button>

        </div>


          <div
            ref={boardRef}
            className="relative w-full grid grid-cols-6 grid-rows-2 max-h-[80vh] border-2 border-gray-300 rounded bg-white overflow-hidden"
            onClick={handleBoardClick}
          >
            {images.map((img, index) => (
                    <Image
                    className="col-span-1 row-span-1 object-fill"
                        key={ids[index]}
                        id={ids[index]}
                        // CustomComponent={ColourPalette}
                        src={img}
                        initialX={0}
                        initialY={0}
                        initialWidth={170}
                        initialHeight={300}
                        imageSelected={selectedId}
                        handleDelete={handleDelete}
                        handleSelect={handleSelect}
                        bringToFront={bringToFront}
                        boardRef={boardRef}
                        zIndex={zIndexMap[ids[index]] || 1}
                    />
            ))}
            
            <div key={1000} className="col-span-1 row-span-1">
              <Image
              className="w-full h-full object-cover"
                  id={1000}
                  CustomComponent={<ColourPalette />}
                  initialX={0}
                  initialY={0}
                  initialWidth={200}
                  initialHeight={320}
                  imageSelected={1000 === selectedId}
                  handleDelete={handleDelete}
                  handleSelect={handleSelect}
                  bringToFront={bringToFront}
                  urls={images}
              />
            </div>
          </div>
    

  
    
        </div>
    );

}


export default BoardTest;