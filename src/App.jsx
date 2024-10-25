import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const fasterUpdatingIndexesToUpdate = useRef(new Set([]));

  const generateRandomIndices = (amountOfNewNumbers) => {
    const indices = new Set([...fasterUpdatingIndexesToUpdate.current]);
    while (
      indices.size <
      fasterUpdatingIndexesToUpdate.current.size + amountOfNewNumbers
    ) {
      const randomIndex = Math.floor(Math.random() * 16);
      const randomValue = Math.ceil(Math.random() * 2) * 2;
      const newString = `${randomIndex}.${randomValue}`;

      // Check if the number before the dot is already present in the Set
      const isUnique = Array.from(indices).every(
        (item) => parseInt(item.split(".")[0]) !== randomIndex
      );

      // If unique, add to the Set
      if (isUnique) {
        indices.add(newString);
      }
    }
    fasterUpdatingIndexesToUpdate.current = indices;
    return indices;
  };

  const giveCorrectBackgroundColor = (innerDiv, value) => {
    switch (value) {
      case 2:
        innerDiv.style.backgroundColor = "#eee4da";
        break;

      case 4:
        innerDiv.style.backgroundColor = "#ede0c8";
        break;

      case 8:
        innerDiv.style.backgroundColor = "#f2b179";
        break;

      case 16:
        innerDiv.style.backgroundColor = "#f59563";
        break;

      case 32:
        innerDiv.style.backgroundColor = "#f67c5f";
        break;

      case 64:
        innerDiv.style.backgroundColor = "#f65e3b";
        break;

      case 128:
        innerDiv.style.backgroundColor = "#edcf72";
        break;

      case 256:
        innerDiv.style.backgroundColor = "#edcc61";
        innerDiv.style.boxShadow = "0 0 30px 10px rgba(243, 215, 116, 0.31746), inset 0 0 0 1px rgba(255, 255, 255, 0.19048)";
        break;

      case 512:
        innerDiv.style.backgroundColor = "#edc850";
        innerDiv.style.boxShadow = "0 0 30px 10px rgba(243, 215, 116, 0.39683), inset 0 0 0 1px rgba(255, 255, 255, 0.2381)";
        break;

      case 1024:
        innerDiv.style.backgroundColor = "#edc53f";
        innerDiv.style.boxShadow = "0 0 30px 10px rgba(243, 215, 116, 0.47619), inset 0 0 0 1px rgba(255, 255, 255, 0.28571)";
        break;

      case 2048:
        innerDiv.style.backgroundColor = "#f6d258";
        innerDiv.style.boxShadow = "0 0 10px 10px rgba(243, 215, 116, 0.47619), inset 0 0 0 2px rgba(255, 255, 255, 0.28571)";
        break;

      default:
        console.log("whoa, easy there tiger");
        break;
    }
  };

  const [indexesToUpdate, setIndexesToUpdate] = useState(() =>
    generateRandomIndices(9)
  );
  const numOfMovesToBeMade = useRef([]);
  const board = useRef(null);
  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      shiftToTheLeftOrRight("right");
    }
    if (event.key === "ArrowLeft") {
      shiftToTheLeftOrRight("left");
    }
    if (event.key === "ArrowUp") {
      shiftToTheLeftOrRight("up");
    }
    if (event.key === "ArrowDown") {
      shiftToTheLeftOrRight("down");
    }
  };

  const getNewIndexPositions = () => {
    const indices = new Set();
    const gridItems = board.current.querySelectorAll(".grid-item");
    const filteredGridItems = Array.from(gridItems).filter((node) => {
      if (Array.from(node.childNodes).length > 0) return true;
      return false;
    });
    filteredGridItems.forEach((gridItemWithChild) => {
      const index = gridItemWithChild.getAttribute("data-key");
      const value = gridItemWithChild.textContent;
      indices.add(index + "." + value);
    });

    fasterUpdatingIndexesToUpdate.current = indices;
    generateRandomIndices(1);
    return indices;
  };

  const shiftToTheLeftOrRight = (direction) => {
    let shiftingToTheRight = false;
    let shiftingToTheLeft = false;
    let shiftingUp = false;
    let shiftingDown = false;
    if (direction === "right") {
      shiftingToTheRight = true;
    } else if (direction === "left") {
      shiftingToTheLeft = true;
    } else if (direction === "up") {
      shiftingUp = true;
    } else if (direction === "down") {
      shiftingDown = true;
    }
    const gridItems = board.current.querySelectorAll(".grid-item");
    const innerDivs = document.querySelectorAll(".grid-item > div");
    calculateNumOfMovesToBeMade(direction);
    const atleastOneTileWillMove =
      numOfMovesToBeMade.current.filter((numOfMoves) => numOfMoves === 0)
        .length < 16;
    if (atleastOneTileWillMove) {
      innerDivs.forEach((innerDiv, index) => {
        const innerDivWidth = innerDiv.offsetWidth;
        const translateValue = innerDivWidth + 10;
        const prevParentIndex = parseInt(
          innerDiv.parentElement.getAttribute("data-key")
        );
        const amountOfSteps = numOfMovesToBeMade.current[prevParentIndex];
        const nextParentIndex = shiftingToTheRight
          ? prevParentIndex + amountOfSteps
          : shiftingToTheLeft
          ? prevParentIndex - amountOfSteps
          : shiftingDown
          ? prevParentIndex + 4 * amountOfSteps
          : shiftingUp
          ? prevParentIndex - 4 * amountOfSteps
          : -1;
        const addOrSubtract = shiftingToTheRight || shiftingDown ? "" : "-";
        const xOrY = shiftingDown || shiftingUp ? "Y" : "X";
        innerDiv.style.transform = `translate${xOrY}(${addOrSubtract}${
          translateValue * amountOfSteps
        }px)`;
        const onTransitionEnd = () => {
          const slot = gridItems[nextParentIndex];
          slot.appendChild(innerDiv);
          innerDiv.style.transform = "";
          const children = slot.querySelectorAll("div");
          if (children.length === 2) {
          } else if (children.length > 2) {
            console.warn("it shouldn't be more than two but sometimes it is");
          }
          if (index === innerDivs.length - 1) {
            gridItems.forEach(gridItem => {
              if (gridItem.children.length === 2) {
                const firstChild = gridItem.children[0];
                const secondChild = gridItem.children[1];
                secondChild.value = secondChild.value + firstChild.value;
                if (secondChild.value !== firstChild.value * 2)
                  console.warn("whyy?");
                gridItem.removeChild(firstChild);
                secondChild.innerHTML = secondChild.value;
                giveCorrectBackgroundColor(secondChild, secondChild.value);
              }
            });
            getNewIndexPositions();
            setIndexesToUpdate(fasterUpdatingIndexesToUpdate.current);
          }
          innerDiv.removeEventListener("transitionend", onTransitionEnd);
        };

        innerDiv.addEventListener("transitionend", onTransitionEnd);
      });
    } else console.log("no movement needed");
  };

  const calculateNumOfMovesToBeMade = (direction) => {
    let start, end, step, isCountingDown;
    if (direction === "right") {
      isCountingDown = true;
      start = 3;
      end = 0;
      step = -1;
    } else if (direction === "left") {
      isCountingDown = false;
      start = 0;
      end = 3;
      step = 1;
    } else if (direction === "down") {
      isCountingDown = true;
      start = 3;
      end = 0;
      step = -1;
    } else if (direction === "up") {
      isCountingDown = false;
      start = 0;
      end = 3;
      step = 1;
    }
    const numOfStepsToMoveForEachPosition = new Array(16).fill(0);

    for (let i = start; isCountingDown ? i >= end : i <= end; i += step) {
      let numOfFilledSlotsBlockingThePath = [];
      for (let j = start; isCountingDown ? j >= end : j <= end; j += step) {
        const shiftingLeftOrRight =
          direction === "right" || direction === "left" ? true : false;
        const currIndex = shiftingLeftOrRight ? i * 4 + j : j * 4 + i;
        const currIndex2 = j * 4 + i;
        let alreadyAdded = 0;
        let stepsToMove = -1;
        fasterUpdatingIndexesToUpdate.current.forEach((indexAndValue) => {
          const [index, value] = indexAndValue.split(".").map(Number);
          if (index === currIndex) {
            switch (j) {
              case start:
                stepsToMove = 0;
                alreadyAdded++;
                numOfFilledSlotsBlockingThePath.unshift(value);
                break;

              case start + step:
                if (
                  numOfFilledSlotsBlockingThePath.length === 1 &&
                  numOfFilledSlotsBlockingThePath[0] !== value
                ) {
                  stepsToMove = 0;
                  alreadyAdded++;
                  numOfFilledSlotsBlockingThePath.unshift(value);
                } else {
                  stepsToMove = 1;
                  alreadyAdded++;
                  if (numOfFilledSlotsBlockingThePath.length === 0) {
                    numOfFilledSlotsBlockingThePath.unshift(value);
                  } else {
                    numOfFilledSlotsBlockingThePath[0] = value * 2 + 0.1;
                  }
                }
                break;

              case start + step + step:
                if (numOfFilledSlotsBlockingThePath.length === 2) {
                  if (numOfFilledSlotsBlockingThePath[0] !== value) {
                    stepsToMove = 0;
                    alreadyAdded++;
                    numOfFilledSlotsBlockingThePath.unshift(value);
                  } else {
                    stepsToMove = 1;
                    alreadyAdded++;
                    numOfFilledSlotsBlockingThePath[0] = value * 2 + 0.1;
                  }
                } else if (numOfFilledSlotsBlockingThePath.length === 1) {
                  if (numOfFilledSlotsBlockingThePath[0] !== value) {
                    stepsToMove = 1;
                    alreadyAdded++;
                    numOfFilledSlotsBlockingThePath.unshift(value);
                  } else {
                    stepsToMove = 2;
                    alreadyAdded++;
                    numOfFilledSlotsBlockingThePath[0] = value * 2 + 0.1;
                  }
                } else {
                  stepsToMove = 2;
                  alreadyAdded++;
                  numOfFilledSlotsBlockingThePath.unshift(value);
                }
                break;

              case end:
                if (numOfFilledSlotsBlockingThePath.length === 3) {
                  if (numOfFilledSlotsBlockingThePath[0] !== value) {
                    stepsToMove = 0;
                    alreadyAdded++;
                  } else {
                    stepsToMove = 1;
                    alreadyAdded++;
                  }
                } else if (numOfFilledSlotsBlockingThePath.length === 2) {
                  if (numOfFilledSlotsBlockingThePath[0] === value) {
                    stepsToMove = 2;
                    alreadyAdded++;
                  } else {
                    stepsToMove = 1;
                    alreadyAdded++;
                  }
                } else if (numOfFilledSlotsBlockingThePath.length === 1) {
                  if (numOfFilledSlotsBlockingThePath[0] === value) {
                    stepsToMove = 3;
                    alreadyAdded++;
                  } else {
                    stepsToMove = 2;
                    alreadyAdded++;
                  }
                } else {
                  stepsToMove = 3;
                  alreadyAdded++;
                }
                break;

              default:
                console.error("OOOOHH nooo");
                break;
            }
          }
        });
        if (alreadyAdded === 1) {
        } else if (alreadyAdded === 0) {
          stepsToMove = 0;
        } else {
          console.error("this shouldn't happen");
        }
        numOfStepsToMoveForEachPosition[currIndex] = stepsToMove;
      }
    }
    numOfMovesToBeMade.current = [...numOfStepsToMoveForEachPosition];
    //testing to see if something went wrong
    if (numOfStepsToMoveForEachPosition.length === 16) {
      console.log("all might be well");
    } else {
      console.error("oh ooh, that sucks");
    }
  };

  useEffect(() => {
    const gridItems = board.current.querySelectorAll(".grid-item");
    gridItems.forEach((item) => {
      item.innerHTML = "";
      item.style.transform = "none";
    });

    //creates an innerDiv for each filled slot
    //gridItems is also needed so that the innerDivs are appended to the correct grid-item
    indexesToUpdate.forEach((indexAndValue) => {
      const [index, value] = indexAndValue.split(".").map(Number);
      const innerDiv = document.createElement("div");
      giveCorrectBackgroundColor(innerDiv, value);
      innerDiv.innerHTML = value;
      innerDiv.value = value;
      innerDiv.style.width = "100%";
      innerDiv.style.height = "100%";
      innerDiv.style.position = "absolute";
      innerDiv.style.zIndex = "1";
      innerDiv.style.transition = "transform 250ms ease";
      gridItems[index].appendChild(innerDiv);
    });
  }, [indexesToUpdate]);
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="grid-container" ref={board}>
      {Array.from({ length: 16 }).map((_, index) => (
        <div className="grid-item" key={index} data-key={index}></div>
      ))}
    </div>
  );
}

export default App;
