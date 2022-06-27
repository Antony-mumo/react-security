import React from "react";

class ListErrors extends React.Component {
  render() {
    const errors = this.props.errors;
    if (errors) {
      return (
        <ul className="error-messages" id="article-errors">
          {Object.keys(errors).map(key => {
            return errors[key].map((item, index) => {
              return (
                <li key={key + index} className="article-error-item">
                  {key} {item}
                </li>
              );
            });
          })}
        </ul>
      );
    } else {
      return null;
    }
  }
}

export default ListErrors;
