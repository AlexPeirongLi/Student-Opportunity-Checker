import { Fragment } from "react/jsx-runtime";
import { MouseEvent } from "react";
function ListGroup() {
  let items = ["New York", "San Francisco", "Tokyo", "London", "Paris"];
  //if(items.length == 0)
  //  return <Fragment><h1>List</h1><p>No items found</p></Fragment>
const handleCLick= (event:MouseEvent) =>console.log(event.);
  return (
    <Fragment>
      <h1>List</h1>
      {items.length === 0 && <p>No items found</p>}
      <ul className="list-group">
        {items.map((item) => (
          <li
            className="list-group-item"
            key={item}
            onClick={handleCLick}
          >
            {item}
          </li>
        ))}
      </ul>
    </Fragment>
  );
}
export default ListGroup;
