import React from 'react';

VideoFHG.propTypes = {};

export default function VideoFHG({id, url, flex = '1 1', maxHeight = 300, borderRadius, autoplay, ...props}) {
   return (
      <video id={id} key={id} style={{flex, maxHeight, borderRadius}} autoPlay={autoplay} {...props}>
         <source src={url} />
      </video>
   );
}
/**
 * Created by Duane Loewen Consulting on 8/17/23.
 */
