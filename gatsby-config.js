module.exports = {
  siteMetadata: {
    title: `My Monthly Payments`,
    description: `Aplicación para gestionar pagos mensuales con Firebase.`,
    author: `Tu Nombre`,
    siteUrl: `https://tusitio.com/`,
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-plugin-typescript",
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `my-monthly-payments`,
        short_name: `payments`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#3498db`,
        display: `standalone`,
        icon: `src/images/icon.png`
      }
    },
    "gatsby-plugin-offline"
  ]
};
