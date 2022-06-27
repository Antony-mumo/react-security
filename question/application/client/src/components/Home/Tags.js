import React from "react";
import agent from "../../utils/agent";
import { withBasename } from "../../utils/params";

const Tags = props => {
  const tags = props.tags;
  if (tags) {
    return (
      <div className="tag-list">
        {tags.map(tag => {
          const handleClick = ev => {
            ev.preventDefault();
            props.onClickTag(
              tag,
              page => agent.Articles.byTag(tag, page),
              agent.Articles.byTag(tag)
            );
          };

          return (
            <a
              href={withBasename("")}
              className="tag-default tag-pill"
              key={tag}
              onClick={handleClick}
            >
              {tag}
            </a>
          );
        })}
      </div>
    );
  } else {
    return <div>Loading Tags...</div>;
  }
};

export default Tags;
