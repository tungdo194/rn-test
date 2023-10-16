import*as e from"../helpers/helpers.js";import*as t from"../../lit-html/lit-html.js";const o=new CSSStyleSheet;o.replaceSync(":host{display:block}h1{font-weight:normal;font-size:18px;line-height:28px;padding:0;margin-top:0;color:var(--color-text-primary)}.intro-steps{counter-reset:custom-counter;list-style:none;margin:16px 0 30px 30px;padding:0}.intro-steps li{color:var(--color-text-primary);counter-increment:custom-counter;font-size:13px;letter-spacing:0.03em;line-height:1.54;margin-bottom:9px;position:relative}.intro-steps li::before{--override-color-counter-background:rgba(26 115 232/25%);box-sizing:border-box;background:var(--override-color-counter-background);border-radius:50%;color:var(--color-primary-old);content:counter(custom-counter);font-size:12px;height:18px;left:-30px;line-height:20px;position:absolute;text-align:center;top:0;width:18px;display:flex;align-items:center;justify-content:center}\n/*# sourceURL=panelIntroductionSteps.css */\n");class n extends HTMLElement{static litTagName=t.literal`devtools-panel-introduction-steps`;#e=this.attachShadow({mode:"open"});#t=this.#o.bind(this);connectedCallback(){this.#e.adoptedStyleSheets=[o],e.ScheduledRender.scheduleRender(this,this.#t)}#o(){if(!e.ScheduledRender.isScheduledRender(this))throw new Error("FeedbackButton render was not scheduled");t.render(t.html` <h1><slot name="title">slot: title</slot></h1> <ol class="intro-steps"> <li><slot name="step-1">slot: step-1</slot></li> <li><slot name="step-2">slot: step-2</slot></li> <li><slot name="step-3">slot: step-3</slot></li> </ol> `,this.#e,{host:this})}}e.CustomElements.defineComponent("devtools-panel-introduction-steps",n);var s=Object.freeze({__proto__:null,PanelIntroductionSteps:n});export{s as PanelIntroductionSteps};
