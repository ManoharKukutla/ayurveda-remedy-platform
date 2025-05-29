import { useParams } from 'react-router-dom';
import { blogData } from '../utils/blogs';

const BlogDetail = () => {
  const { id } = useParams();
  const blog = blogData.find((b) => b.id === id);

  if (!blog) return <div className="p-4">Blog not found</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <img
        src={blog.image}
        alt={blog.title}
        className="w-full h-64 object-cover rounded-xl mb-6 shadow-sm"
      />
      <h1 className="text-3xl font-bold text-white mb-4">{blog.title}</h1>
      <p className="text-white leading-relaxed text-lg whitespace-pre-line">
        {blog.content}
      </p>
    </div>
  );
};

export default BlogDetail;
