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

      default:
        console.log("whoa, easy there tiger");
        break;
    }
  };

  const [indexesToUpdate, setIndexesToUpdate] = useState(() =>
    generateRandomIndices(9)
  );
  const [numOfMovesToBeMade, setNumOfMovesToBeMade] = useState([]);
  const fasterUpdatingNumOfMovesToBeMade = useRef([]);
  const board = useRef(null);
  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      shiftToTheRight();
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

  const shiftToTheRight = () => {
    const gridItems = board.current.querySelectorAll(".grid-item");
    const innerDivs = document.querySelectorAll(".grid-item > div");
    calculateNumOfMovesToBeMade();
    const atleastOneTileWillMove =
      fasterUpdatingNumOfMovesToBeMade.current.filter(
        (numOfMoves) => numOfMoves === 0
      ).length < 16;
    if (atleastOneTileWillMove) {
      innerDivs.forEach((innerDiv, index) => {
        const innerDivWidth = innerDiv.offsetWidth;
        const translateValue = innerDivWidth + 10;
        const prevParentIndex = parseInt(
          innerDiv.parentElement.getAttribute("data-key")
        );
        const amountOfSteps =
          fasterUpdatingNumOfMovesToBeMade.current[prevParentIndex];
        const nextParentIndex = prevParentIndex + amountOfSteps;
        innerDiv.style.transform = `translateX(${
          translateValue * amountOfSteps
        }px)`;
        const onTransitionEnd = () => {
          const slot = gridItems[nextParentIndex];
          slot.appendChild(innerDiv);
          innerDiv.style.transform = "";
          const children = slot.querySelectorAll("div");
          if (children.length === 2) {
          } else if (children.length > 2) {
            console.error("it shouldn't be more than two");
          }
          if (index === innerDivs.length - 1) {
            gridItems.forEach((gridItem, index) => {
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
    }else console.log("no movement");
    // const newIndexes = getNewIndexPositions();
    // setIndexesToUpdate(newIndexes);
  };

  const calculateNumOfMovesToBeMade = () => {
    const numOfStepsToMoveForEachPosition = [];

    //indexesToUpdate is also needed. The loop gives values to the array above.
    console.log(indexesToUpdate, fasterUpdatingIndexesToUpdate.current);
    for (let i = 3; i >= 0; i--) {
      let numOfFilledSlotsToTheRight = [];
      for (let j = 3; j >= 0; j--) {
        let alreadyAdded = 0;
        let steps = -1;
        fasterUpdatingIndexesToUpdate.current.forEach((indexAndValue) => {
          const [index, value] = indexAndValue.split(".").map(Number);
          if (index === i * 4 + j) {
            switch (j) {
              case 3:
                steps = 0;
                alreadyAdded++;
                numOfFilledSlotsToTheRight.unshift(value);
                break;

              case 2:
                if (
                  numOfFilledSlotsToTheRight.length === 1 &&
                  numOfFilledSlotsToTheRight[0] !== value
                ) {
                  steps = 0;
                  alreadyAdded++;
                  numOfFilledSlotsToTheRight.unshift(value);
                } else {
                  steps = 1;
                  alreadyAdded++;
                  if (numOfFilledSlotsToTheRight.length === 0) {
                    numOfFilledSlotsToTheRight.unshift(value);
                  } else {
                    numOfFilledSlotsToTheRight[0] = value * 2 + 0.1;
                  }
                }
                break;

              case 1:
                if (numOfFilledSlotsToTheRight.length === 2) {
                  if (numOfFilledSlotsToTheRight[0] !== value) {
                    steps = 0;
                    alreadyAdded++;
                    numOfFilledSlotsToTheRight.unshift(value);
                  } else {
                    steps = 1;
                    alreadyAdded++;
                    numOfFilledSlotsToTheRight[0] = value * 2 + 0.1;
                  }
                } else if (numOfFilledSlotsToTheRight.length === 1) {
                  if (numOfFilledSlotsToTheRight[0] !== value) {
                    steps = 1;
                    alreadyAdded++;
                    numOfFilledSlotsToTheRight.unshift(value);
                  } else {
                    steps = 2;
                    alreadyAdded++;
                    numOfFilledSlotsToTheRight[0] = value * 2 + 0.1;
                  }
                } else {
                  steps = 2;
                  alreadyAdded++;
                  numOfFilledSlotsToTheRight.unshift(value);
                }
                break;

              case 0:
                if (numOfFilledSlotsToTheRight.length === 3) {
                  if (numOfFilledSlotsToTheRight[0] !== value) {
                    steps = 0;
                    alreadyAdded++;
                  } else {
                    steps = 1;
                    alreadyAdded++;
                  }
                } else if (numOfFilledSlotsToTheRight.length === 2) {
                  if (numOfFilledSlotsToTheRight[0] === value) {
                    steps = 2;
                    alreadyAdded++;
                  } else {
                    steps = 1;
                    alreadyAdded++;
                  }
                } else if (numOfFilledSlotsToTheRight.length === 1) {
                  if (numOfFilledSlotsToTheRight[0] === value) {
                    steps = 3;
                    alreadyAdded++;
                  } else {
                    steps = 2;
                    alreadyAdded++;
                  }
                } else {
                  steps = 3;
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
          steps = 0;
        } else {
          console.error("this shouldn't happen");
        }
        numOfStepsToMoveForEachPosition.unshift(steps);
      }
    }
    fasterUpdatingNumOfMovesToBeMade.current = [
      ...numOfStepsToMoveForEachPosition,
    ];
    setNumOfMovesToBeMade([...numOfStepsToMoveForEachPosition]);
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
      innerDiv.style.transition = "transform 0.5s ease";
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
