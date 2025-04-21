const boxes = document.querySelectorAll(".box");
const image = document.querySelector(".image");
const hiddenDiv = document.querySelector(".hidden");
const shownDiv = document.querySelector(".shown");


boxes.forEach((box) => {
  box.addEventListener("dragover", (e) => {
    e.preventDefault(); // 允许拖拽
  });

  box.addEventListener("drop", (e) => {
    e.preventDefault();
    box.appendChild(image); // 将图片放入目标容器

    // 判断是否拖入右边的box
    if (box.id === "right") {
        hiddenDiv.classList.remove("hidden"); 
        shownDiv.classList.add("hidden")// 显示文字
      } else {
        hiddenDiv.classList.add("hidden");
        shownDiv.classList.remove("hidden")
  }});
});