import{t as e}from"./rolldown-runtime.Dh6celcD.mjs";import{B as t,I as n,P as r,R as i,T as a,k as o,l as s,s as c}from"./react.CM67cbm2.mjs";import{M as l,et as u,s as d}from"./framer.muyu6I5R.mjs";import{x as f,y as p}from"./propUtils.2fBYK2tS.mjs";import{r as m,t as h}from"./OIjZRBmWDcIE2B6qgG1j.CGhof-gy.mjs";var g=e((()=>{h()}));function _({type:e,url:t,html:n,style:r={}}){return e===`url`&&t?s(y,{url:t,style:r}):e===`html`&&n?s(x,{html:n,style:r}):s(v,{style:r})}function v({style:e}){return s(`div`,{style:{minHeight:O(e),...f,overflow:`hidden`,...e},children:s(`div`,{style:j,children:`To embed a website or widget, add it to the properties\xA0panel.`})})}function y({url:e,style:t}){let i=!t.height;/[a-z]+:\/\//.test(e)||(e=`https://`+e);let a=m(),[o,c]=n(a?void 0:!1);return r(()=>{if(!a)return;let t=!0;c(void 0);async function n(){let n=await fetch(`https://api.framer.com/functions/check-iframe-url?url=`+encodeURIComponent(e));if(n.status==200){let{isBlocked:e}=await n.json();t&&c(e)}else{let e=await n.text();console.error(e),c(Error(`This site can’t be reached.`))}}return n().catch(e=>{console.error(e),c(e)}),()=>{t=!1}},[e]),a&&i?s(D,{message:`URL embeds do not support auto height.`,style:t}):e.startsWith(`https://`)?o===void 0?s(E,{}):o instanceof Error?s(D,{message:o.message,style:t}):o===!0?s(D,{message:`Can’t embed ${e} due to its content security policy.`,style:t}):s(`iframe`,{src:e,style:{...k,...t},loading:`lazy`,fetchPriority:a?`low`:`auto`,referrerPolicy:`no-referrer`,sandbox:b(a)}):s(D,{message:`Unsupported protocol.`,style:t})}function b(e){let t=[`allow-same-origin`,`allow-scripts`];return e||t.push(`allow-downloads`,`allow-forms`,`allow-modals`,`allow-orientation-lock`,`allow-pointer-lock`,`allow-popups`,`allow-popups-to-escape-sandbox`,`allow-presentation`,`allow-storage-access-by-user-activation`,`allow-top-navigation-by-user-activation`),t.join(` `)}function x({html:e,...t}){if(e.includes(`<\/script>`)){let n=e.includes(`</spline-viewer>`),r=e.includes(`<!-- framer-direct-embed -->`);return s(n||r?C:S,{html:e,...t})}return s(w,{html:e,...t})}function S({html:e,style:i}){let a=o(),[c,l]=n(0);r(()=>{let e=a.current?.contentWindow;function n(t){if(t.source!==e)return;let n=t.data;if(typeof n!=`object`||!n)return;let r=n.embedHeight;typeof r==`number`&&l(r)}return t.addEventListener(`message`,n),e?.postMessage(`getEmbedHeight`,`*`),()=>{t.removeEventListener(`message`,n)}},[]);let u=`
<html>
    <head>
        <style>
            html, body {
                margin: 0;
                padding: 0;
            }

            body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }

            :root {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            * {
                box-sizing: border-box;
                -webkit-font-smoothing: inherit;
            }

            h1, h2, h3, h4, h5, h6, p, figure {
                margin: 0;
            }

            body, input, textarea, select, button {
                font-size: 12px;
                font-family: sans-serif;
            }
        </style>
    </head>
    <body>
        ${e}
        <script type="module">
            let height = 0

            function sendEmbedHeight() {
                window.parent.postMessage({
                    embedHeight: height
                }, "*")
            }

            const observer = new ResizeObserver((entries) => {
                if (entries.length !== 1) return
                const entry = entries[0]
                if (entry.target !== document.body) return

                height = entry.contentRect.height
                sendEmbedHeight()
            })

            observer.observe(document.body)

            window.addEventListener("message", (event) => {
                if (event.source !== window.parent) return
                if (event.data !== "getEmbedHeight") return
                sendEmbedHeight()
            })
        <\/script>
    <body>
</html>
`,d={...k,...i};return i.height||(d.height=c+`px`),s(`iframe`,{ref:a,style:d,srcDoc:u})}function C({html:e,style:t}){let n=o();return r(()=>{let t=n.current;if(t)return t.innerHTML=e,T(t),()=>{t.innerHTML=``}},[e]),s(`div`,{ref:n,style:{...A,...t}})}function w({html:e,style:t}){return s(`div`,{style:{...A,...t},dangerouslySetInnerHTML:{__html:e}})}function T(e){if(e instanceof Element&&e.tagName===`SCRIPT`){let t=document.createElement(`script`);t.text=e.innerHTML;for(let{name:n,value:r}of e.attributes)t.setAttribute(n,r);e.parentElement.replaceChild(t,e)}else for(let t of e.childNodes)T(t)}function E(){return s(`div`,{className:`framerInternalUI-componentPlaceholder`,style:{...p,overflow:`hidden`},children:s(`div`,{style:j,children:`Loading…`})})}function D({message:e,style:t}){return s(`div`,{className:`framerInternalUI-errorPlaceholder`,style:{minHeight:O(t),...p,overflow:`hidden`,...t},children:s(`div`,{style:j,children:e})})}function O(e){if(!e.height)return 200}var k,A,j,M=e((()=>{i(),c(),a(),u(),g(),l(_,{type:{type:d.Enum,defaultValue:`url`,displaySegmentedControl:!0,options:[`url`,`html`],optionTitles:[`URL`,`HTML`]},url:{title:`URL`,type:d.String,description:`Some websites don’t support embedding.`,hidden(e){return e.type!==`url`}},html:{title:`HTML`,type:d.String,displayTextArea:!0,hidden(e){return e.type!==`html`}}}),k={width:`100%`,height:`100%`,border:`none`},A={width:`100%`,height:`100%`,display:`flex`,flexDirection:`column`,justifyContent:`center`,alignItems:`center`},j={textAlign:`center`,minWidth:140}}));export{M as n,_ as t};
//# sourceMappingURL=Embed.B4aPB8Mp.mjs.map