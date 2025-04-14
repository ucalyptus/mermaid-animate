import React, { useEffect, useState, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import { FileCode2, Play, RefreshCw, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import GIF from 'gif.js';

// Create a Web Worker URL for gif.js
const gifWorkerBlob = new Blob([
  `(function(b){function a(b,d){if({}.hasOwnProperty.call(a.cache,b))return a.cache[b];var e=a.resolve(b);if(!e)throw new Error('Failed to resolve module '+b);var c={id:b,require:a,filename:b,exports:{},loaded:!1,parent:d,children:[]};d&&d.children.push(c);var f=b.slice(0,b.lastIndexOf('/')+1);return a.cache[b]=c.exports,e.call(c.exports,c,c.exports,f,b),c.loaded=!0,a.cache[b]=c.exports}a.modules={},a.cache={},a.resolve=function(b){return{}.hasOwnProperty.call(a.modules,b)?a.modules[b]:void 0},a.define=function(b,c){a.modules[b]=c};a.define('/gif.worker.js',function(d,e,f,g){e.exports=function(d){function e(d){var a=d.length;if(2>a||a>256||a&a-1)throw'Invalid code/color length, must be power of 2 and 2 .. 256.';return a}var a=0,b=[];return{loops:0,dispose:2,on:function(a,c){b[a]=c},emit:function(a){b[a].apply(null,Array.prototype.slice.call(arguments,1))},writeHeader:function(){a++},writeFrame:function(){a++},finish:function(){},setOption:function(a,b){a=='loops'?this.loops=b:this.dispose=b},addFrame:function(c,d){function f(){for(var c=0,d={};c<a;c++)d[c]=c;return d}function g(a,b,c){var d=a[b];a[b]=a[c],a[c]=d}function h(a,b,c,d){for(var f=Math.min(a,b),e=Math.max(a,b),g=f;g<e+1;g++)c[d[g]]=1}var b,e,i,m,n,o,p,q,r,s,t,u,v,w,x,k=4,l=Math.max(c.length,d.length);for(i=e=0;i<l;i++){if(m=c[i],n=d[i],m!==n&&(e++,m>n&&(b=c,c=d,d=b)),!m&&!n)k=Math.min(k,i)}if(e<2)k=l;else{for(i=0;i<l;i++)if(c[i]||d[i]){k=Math.min(k,i);break}if(e===l){for(t=f(),u=f(),o=b=0;o<l;o++)v=c[o],w=d[o],v?(v<b&&(b=v),v>p&&(p=v)):w<b&&(b=w),w>p&&(p=w),t[o]=v||b-1,u[o]=w||b-1;if(e=p-b+1,e>=l)k=l;else{for(x={},o=0;o<l;o++)v=t[o],v<b&&(v=b),v>p&&(v=p),x[v]=1;for(q=b,e=1;q<p;q++)x[q]&&(x[q]=e++);for(o=0;o<l;o++)t[o]=x[t[o]],u[o]=x[u[o]];k=0;for(o=l-1;o>=0&&t[o]===u[o];o--)k++}}else{for(r={},s={},o=b=0;o<l;o++)v=c[o],w=d[o],v&&!s[o]?(v<b&&(b=v),v>p&&(p=v),r[o]=1,e=1):w&&!r[o]&&(w<b&&(b=w),w>p&&(p=w),s[o]=1,e=1);if(e===l)k=l;else{do{for(q in t=f(),u=f(),r)q=parseInt(q,10),h(b,c[q],t,c);for(q in s)q=parseInt(q,10),h(b,d[q],u,d);e=0;for(o=0;o<l;o++)t[o]===u[o]&&t[o]>=b&&(e=1);if(e){for(o=b,e=1;o<p;o++)t[o]&&(t[o]=e++);for(o=b,e=1;o<p;o++)u[o]&&(u[o]=e++);for(o=0;o<l;o++)c[o]&&(c[o]=t[c[o]]),d[o]&&(d[o]=u[d[o]]);k=0;for(o=l-1;o>=0&&c[o]===d[o];o--)k++;break}for(o=0;o<l;o++)if(c[o]||d[o]){g(c,o,Math.floor(Math.random()*l));break}}while(1)}}}}return k},setDelay:function(a){},setFrameRate:function(a){},setDispose:function(a){this.dispose=a},setRepeat:function(a){this.loops=a},setTransparent:function(a){},addFrame:function(a){this.emit('frame',a)},render:function(){this.emit('finished')},abort:function(){},getOutputBuffer:function(){},getOutputBufferPosition:function(){},setOutputBuffer:function(){},setOutputBufferPosition:function(){}}},{})}),a('/gif.worker.js')}`
], { type: 'application/javascript' });

const gifWorkerUrl = URL.createObjectURL(gifWorkerBlob);

const defaultDiagram = `graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
    E -->|back| C`;

function App() {
  const [mermaidCode, setMermaidCode] = useState(defaultDiagram);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const renderDiagram = useCallback(async (code: string) => {
    try {
      setIsLoading(true);
      setError('');
      const { svg } = await mermaid.render('graph-div', code);
      setSvg(svg);
      setError('');
    } catch (err) {
      setError('Invalid Mermaid syntax. Please check your code.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportToGif = async () => {
    if (!previewRef.current) return;
    
    try {
      setIsExporting(true);
      const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: gifWorkerUrl,
        width: previewRef.current.offsetWidth,
        height: previewRef.current.offsetHeight,
        background: '#ffffff',
      });

      // Create a promise to handle the GIF generation
      const gifPromise = new Promise((resolve, reject) => {
        gif.on('finished', resolve);
        gif.on('error', reject);
      });

      // Capture frames
      const frames = 20; // Increased number of frames for smoother animation
      const frameDelay = 50; // Decreased delay between frames
      for (let i = 0; i < frames; i++) {
        const dataUrl = await toPng(previewRef.current, {
          backgroundColor: '#ffffff',
        });
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => {
            gif.addFrame(img, { delay: frameDelay, copy: true });
            resolve();
          };
          img.src = dataUrl;
        });
        // Wait a bit to capture the next frame of the animation
        await new Promise(resolve => setTimeout(resolve, frameDelay));
      }

      // Render the GIF
      gif.render();

      // Wait for the GIF to be generated
      const blob = await gifPromise as Blob;
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowchart.gif';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting GIF:', err);
      setError('Failed to export GIF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Initialize mermaid once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });

    // Cleanup worker URL
    return () => {
      URL.revokeObjectURL(gifWorkerUrl);
    };
  }, []);

  // Render diagram whenever code changes
  useEffect(() => {
    renderDiagram(mermaidCode);
  }, [mermaidCode, renderDiagram]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <FileCode2 className="w-8 h-8" />
            Mermaid Flowchart Animator
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-lg font-semibold">Mermaid Code</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => renderDiagram(mermaidCode)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Render
                      </>
                    )}
                  </button>
                  <button
                    onClick={exportToGif}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                    disabled={isExporting || isLoading}
                  >
                    {isExporting ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Save as GIF
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <textarea
                value={mermaidCode}
                onChange={(e) => setMermaidCode(e.target.value)}
                className="w-full h-[400px] p-4 font-mono text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your Mermaid flowchart code here..."
              />
              
              {error && (
                <div className="text-red-500 bg-red-50 p-4 rounded-md">
                  {error}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              <div 
                ref={previewRef}
                className="mermaid-preview"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;