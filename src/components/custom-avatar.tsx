import { Avatar, AvatarProps } from 'antd'
import React from 'react'

type Props = AvatarProps & {
    name?: string
}

const CustomAvatar = ({name, style, ...rest}: Props) => {
  return (
    <Avatar 
     alt={'Bikash Halder'} 
     size="small"
     style={{
     backgroundColor: '#87d0dd', 
     display:"flex", 
     alignItems:'center', 
     border:'none',
     ...style
     }}
     {...rest}
     >
        {name}
     </Avatar>
  )
}

export default CustomAvatar