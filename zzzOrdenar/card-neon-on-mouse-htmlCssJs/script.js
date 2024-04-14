const el = document.querySelector(".noti")
const glowEl = document.querySelector(".notiglow")
const borderEl = document.querySelector(".notiborderglow")

// if the pen is in thumbnail view, scale it up
if (location.pathname.match(/fullcpgrid/i) ? true : false) {
  document.documentElement.style.fontSize = "48px"
}


let isHovering = false

el.addEventListener("mousemove", (event) => {
  const rect = el.getBoundingClientRect()
  const localX = (event.clientX - rect.left) / rect.width
  const localY = (event.clientY - rect.top) / rect.height
  
  console.log(localX, localY)
  glowEl.style.left = localX * 100 + "%"
  glowEl.style.top = localY * 100 + "%"
  
  borderEl.style.left = localX * 100 + "%"
  borderEl.style.top = localY * 100 + "%"
  
  if (isHovering) {
    glowEl.style.transition = "inset 50ms linear, opacity 300ms ease";
    borderEl.style.transition = "inset 50ms linear, opacity 300ms ease"
  } else {
    glowEl.style.transition = "opacity 300ms ease"
    borderEl.style.transition = "opacity 300ms ease"
  }
  
  isHovering = false
});

el.addEventListener("mouseout", (event) => {
  isHovering = true;
})