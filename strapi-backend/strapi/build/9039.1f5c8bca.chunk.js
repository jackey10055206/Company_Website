"use strict";(self.webpackChunkstrapi_project=self.webpackChunkstrapi_project||[]).push([[9039],{77452:(I,D,_)=>{_.d(D,{S:()=>L});var E=_(92132),P=_(90151),a=_(68074),O=_(79739),o=_(83997),l=_(30893),i=_(54894),n=_(71389),M=_(42638);const L=({providers:s,displayAllProviders:r})=>{const{formatMessage:C}=(0,i.A)();return r?(0,E.jsx)(P.x,{gap:4,children:s.map(t=>(0,E.jsx)(a.E,{col:4,children:(0,E.jsx)(d,{provider:t})},t.uid))}):s.length>2&&!r?(0,E.jsxs)(P.x,{gap:4,children:[s.slice(0,2).map(t=>(0,E.jsx)(a.E,{col:4,children:(0,E.jsx)(d,{provider:t})},t.uid)),(0,E.jsx)(a.E,{col:4,children:(0,E.jsx)(O.m,{label:C({id:"global.see-more"}),children:(0,E.jsx)(h,{as:n.N_,to:"/auth/providers",children:(0,E.jsx)("span",{"aria-hidden":!0,children:"\u2022\u2022\u2022"})})})})]}):(0,E.jsx)(A,{justifyContent:"center",children:s.map(t=>(0,E.jsx)(d,{provider:t},t.uid))})},A=(0,M.Ay)(o.s)`
  & a:not(:first-child):not(:last-child) {
    margin: 0 ${({theme:s})=>s.spaces[2]};
  }
  & a:first-child {
    margin-right: ${({theme:s})=>s.spaces[2]};
  }
  & a:last-child {
    margin-left: ${({theme:s})=>s.spaces[2]};
  }
`,d=({provider:s})=>(0,E.jsx)(O.m,{label:s.displayName,children:(0,E.jsx)(h,{href:`${window.strapi.backendURL}/admin/connect/${s.uid}`,children:s.icon?(0,E.jsx)("img",{src:s.icon,"aria-hidden":!0,alt:"",height:"32px"}):(0,E.jsx)(l.o,{children:s.displayName})})}),h=M.Ay.a`
  width: ${136/16}rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${48/16}rem;
  border: 1px solid ${({theme:s})=>s.colors.neutral150};
  border-radius: ${({theme:s})=>s.borderRadius};
  text-decoration: inherit;
  &:link {
    text-decoration: none;
  }
  color: ${({theme:s})=>s.colors.neutral600};
`},79039:(I,D,_)=>{_.r(D),_.d(D,{LoginEE:()=>T});var E=_(92132),P=_(48653),a=_(94061),O=_(83997),o=_(30893),l=_(54894),i=_(42638),n=_(60074),M=_(77452),L=_(56445),A=_(15126),d=_(63299),h=_(67014),s=_(59080),r=_(79275),C=_(14718),t=_(21272),K=_(82437),m=_(61535),g=_(5790),x=_(12083),j=_(35223),y=_(5409),f=_(74930),c=_(2600),S=_(48940),$=_(41286),N=_(51187),F=_(56336),G=_(39404),z=_(58692),Z=_(54257),H=_(501),J=_(57646),Q=_(23120),V=_(44414),X=_(25962),Y=_(14664),u=_(42588),p=_(90325),e=_(62785),w=_(87443),k=_(41032),b=_(22957),q=_(93179),__=_(73055),E_=_(15747),s_=_(85306),t_=_(77965),a_=_(26509),O_=_(84624),n_=_(71210),D_=_(32058),P_=_(81185),M_=_(82261);const B=(0,i.Ay)(P.c)`
  flex: 1;
`,T=R=>{const{formatMessage:U}=(0,l.A)(),{isLoading:W,data:v=[]}=(0,n.g)(void 0,{skip:!window.strapi.features.isEnabled(window.strapi.features.SSO)});return!window.strapi.features.isEnabled(window.strapi.features.SSO)||!W&&v.length===0?(0,E.jsx)(n.L,{...R}):(0,E.jsx)(n.L,{...R,children:(0,E.jsx)(a.a,{paddingTop:7,children:(0,E.jsxs)(O.s,{direction:"column",alignItems:"stretch",gap:7,children:[(0,E.jsxs)(O.s,{children:[(0,E.jsx)(B,{}),(0,E.jsx)(a.a,{paddingLeft:3,paddingRight:3,children:(0,E.jsx)(o.o,{variant:"sigma",textColor:"neutral600",children:U({id:"Auth.login.sso.divider"})})}),(0,E.jsx)(B,{})]}),(0,E.jsx)(M.S,{providers:v,displayAllProviders:!1})]})})})}}}]);
