const template = (variables, { tpl }) => {
  return tpl`
import MUISvgIcon from '@mui/material/SvgIcon';
${variables.imports};

${variables.interfaces};

const ${variables.componentName} = (${variables.props}) => React.createElement(MUISvgIcon, props, ${variables.jsx})

${variables.exports};
`;
};

module.exports = template;
